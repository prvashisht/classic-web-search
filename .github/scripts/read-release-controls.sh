#!/usr/bin/env bash

set -euo pipefail

CONTROL_FILE="${1:-.github/release-controls.conf}"
SKIP_RELEASE=false
SKIP_DEPLOY=false

normalize_bool() {
  local key="$1"
  local value="$2"

  case "$value" in
    true|yes|1)
      echo "true"
      ;;
    false|no|0|"")
      echo "false"
      ;;
    *)
      echo "::error file=$CONTROL_FILE::Invalid $key value '$value'. Use true or false."
      exit 1
      ;;
  esac
}

write_output() {
  local key="$1"
  local value="$2"

  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "$key=$value" >> "$GITHUB_OUTPUT"
  else
    echo "$key=$value"
  fi
}

if [ -r "$CONTROL_FILE" ]; then
  while IFS='=' read -r raw_key raw_value || [ -n "${raw_key:-}" ]; do
    key="$(printf '%s' "$raw_key" | sed 's/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]')"
    value="$(printf '%s' "${raw_value:-}" | sed 's/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//' | tr '[:upper:]' '[:lower:]')"

    if [ -z "$key" ]; then
      continue
    fi

    case "$key" in
      skip_release)
        SKIP_RELEASE="$(normalize_bool "$key" "$value")"
        ;;
      skip_deploy)
        SKIP_DEPLOY="$(normalize_bool "$key" "$value")"
        ;;
      *)
        echo "::warning file=$CONTROL_FILE::Ignoring unknown release control '$key'"
        ;;
    esac
  done < "$CONTROL_FILE"
fi

if [ "$SKIP_RELEASE" = "true" ]; then
  SKIP_DEPLOY_EFFECTIVE=true
else
  SKIP_DEPLOY_EFFECTIVE="$SKIP_DEPLOY"
fi

write_output "skip_release" "$SKIP_RELEASE"
write_output "skip_deploy" "$SKIP_DEPLOY"
write_output "skip_deploy_effective" "$SKIP_DEPLOY_EFFECTIVE"
