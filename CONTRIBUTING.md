# Contributing

Thanks for helping improve Classic Web Search for Google. This project is a
small browser extension, so changes are easiest to review when they stay focused
and include the browser checks needed to prove the behavior.

## Branches And Pull Requests

- Create a focused branch for each logical change.
- Use branch names like `fix/direct-udm-redirect`, `feat/add-options-page`, or
  `docs/update-readme`.
- Use pull request titles like `fix: redirect Google searches with udm URL
  rewrite`.
- Describe the user-visible behavior change, affected browsers, and manual test
  results.
- Keep unrelated formatting and cleanup out of behavior changes.

## Change Types

- `fix`: Runtime bug fix or behavior correction.
- `feat`: User-visible capability.
- `ci`: GitHub Actions, release, store deploy, or automation.
- `build`: Local packaging or build scripts.
- `docs`: README, roadmap, contributing, or release documentation.
- `chore`: Repository maintenance with no runtime behavior.
- `refactor`: Internal restructuring without behavior change.

## Local Setup

Clone the repository and work from the project root:

```sh
git clone https://github.com/prvashisht/classic-web-search.git
cd classic-web-search
```

No dependency install is required for normal development. The build script uses
the local shell, Node.js, `zip`, and standard filesystem tools.

## Build

Run the local packaging script:

```sh
./build.sh
```

The script creates browser-specific packages under `dist/`:

- `classic-web-search-chrome-vX.X.X.zip`
- `classic-web-search-firefox-vX.X.X.zip`

`dist/` is ignored by Git and should not be committed.

## Manual Browser Verification

There is currently no automated test suite. Run the checks that match the files
you changed and include the results in the pull request.

### Chrome

1. Open `chrome://extensions/`.
2. Enable developer mode.
3. Select `Load unpacked`.
4. Choose the repository folder.
5. Enable the extension from the toolbar, context menu, options page, and
   keyboard shortcut as needed for the change.

### Edge

1. Open `edge://extensions/`.
2. Enable developer mode.
3. Select `Load unpacked`.
4. Choose the repository folder.
5. Repeat the Chrome behavior checks for the changed flow.

### Firefox

1. Run `./build.sh`.
2. Unpack the generated Firefox artifact:

   ```sh
   VERSION=$(node -p "require('./manifest.json').version")
   mkdir -p dist/firefox-unpacked
   unzip -o "dist/classic-web-search-firefox-v${VERSION}.zip" -d dist/firefox-unpacked
   ```

3. Open `about:debugging#/runtime/this-firefox`.
4. Select `Load Temporary Add-on`.
5. Choose `dist/firefox-unpacked/manifest.json`.
6. Verify the changed flow in Firefox, especially extension pages and browser
   API behavior.

## Redirect Behavior Checks

For redirect-related changes, verify these cases:

- A plain Google search for a new query redirects to a URL with `udm=14`.
- A URL that already has `udm=14` does not loop.
- Search modes with an existing `udm` or `tbm` value are preserved.
- Non-search Google pages are ignored.
- Browser internal pages and tabs without normal HTTP URLs do not throw errors.
- The extension does nothing while disabled.

## Options And Controls Checks

For UI, state, or command changes, verify these cases:

- Toolbar click toggles the enabled state.
- **Alt+Shift+W**, or the configured replacement shortcut, toggles the enabled
  state.
- Context menu actions open the expected pages or links.
- The options page reflects current state, redirect count, version, release
  notes link, shortcut management, review link, and support link.
- Saved state survives extension reloads or service worker restarts.

## Version And Roadmap Updates

- Assess whether a change needs a version bump. Runtime fixes and user-visible
  features usually do; documentation-only changes usually do not.
- Update `ROADMAP.md` when a roadmap item is completed, changed, deferred, or
  superseded.
- Keep release notes readable by using clear pull request titles.

## Release Notes And Store Deployment

Merged pull requests become the source material for generated GitHub release
notes. A version change to `manifest.json` on `main` triggers the release
workflow unless `.github/release-controls.conf` skips it.

Store deployment runs after a successful release when the required Chrome Web
Store and Firefox Add-ons secrets are configured. Edge Add-ons is uploaded
manually.

## Conduct

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) in issues, pull
requests, and reviews.
