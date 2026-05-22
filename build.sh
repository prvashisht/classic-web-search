#!/usr/bin/env bash
# Produces browser-specific extension zips under dist/.
#
# Usage:
#   ./build.sh

set -euo pipefail

VERSION=$(node -p "require('./manifest.json').version")
DIST="dist"
FIREFOX_GECKO_ID="{54c8aa56-f618-456d-996a-0260c64ffdcc}"
FIREFOX_MIN_VERSION="121.0"

SOURCES=(
  icons
  service_worker.js
  webext.js
)

mkdir -p "$DIST"

build() {
  local browser="$1"
  local transform="$2"
  local outfile
  local tmp

  outfile="$(pwd)/$DIST/classic-web-search-${browser}-v${VERSION}.zip"
  tmp="$(mktemp -d)"
  trap "rm -rf '$tmp'" RETURN

  for source in "${SOURCES[@]}"; do
    cp -R "$source" "$tmp/"
  done

  node -e "
    const fs = require('fs');
    const m = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
    const firefoxGeckoId = '$FIREFOX_GECKO_ID';
    const firefoxMinVersion = '$FIREFOX_MIN_VERSION';
    $transform
    fs.writeFileSync('$tmp/manifest.json', JSON.stringify(m, null, 2) + '\n');
  "

  rm -f "$outfile"
  (cd "$tmp" && zip -qr "$outfile" . --exclude "*.DS_Store")
  echo "$outfile"
}

echo "Building Web Only (Classic) Google Search v$VERSION..."

build "chrome" "
  delete m.browser_specific_settings;
  delete m.background.scripts;
"

build "firefox" "
  m.background.scripts = [m.background.service_worker];
  delete m.background.service_worker;
  m.browser_specific_settings = {
    gecko: {
      id: firefoxGeckoId,
      strict_min_version: firefoxMinVersion,
    },
  };
"

echo "Done."
