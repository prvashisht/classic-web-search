# Roadmap

This document tracks planned improvements for Web Only (Classic) Google Search.
It is ordered by suggested implementation priority so small, high-impact changes
land before broader product and release-process work.

## Priority 1: Core Reliability

- [x] Replace DOM-click redirect with direct URL rewriting.
   Update Google search URLs by setting `udm=14` directly from the background
   script instead of finding and clicking the Web tab in the page. This removes
   reliance on Google page structure and timing.

- [ ] Add redirect loop protection and URL guards.
   Redirect only when the current page is a Google `/search` page, a search
   query exists, and `udm` is not already `14`. Preserve user choice when they
   intentionally switch to Images, News, or another search mode.

- [ ] Restore extension state on service worker startup.
   Load saved settings before handling tab updates or toolbar clicks so browser
   service worker restarts do not reset the extension to default in memory.

- [ ] Harden background URL handling.
   Guard against missing or non-HTTP tab URLs before constructing `URL`
   instances, preventing runtime errors on browser pages or incomplete tab
   updates.

## Priority 2: Cross-Browser Support

- [ ] Add a browser API adapter.
   Centralize Chrome, Edge, and Firefox API differences behind a small
   `webext.js` helper so extension logic does not need to mix `chrome.*` and
   `browser.*` assumptions.

- [ ] Generate browser-specific manifests during packaging.
   Keep one source manifest, then produce Chrome/Edge and Firefox-compatible
   manifests at build time.

- [ ] Add Firefox extension metadata.
   Include the Gecko extension ID and minimum supported Firefox version in the
   Firefox build output.

## Priority 3: Build And Release Automation

- [ ] Add a release notes file.
   Track the shipped version and user-facing changes in `release-notes.json`.
   The build should fail if its version does not match `manifest.json`.

- [ ] Add a local packaging script.
   Create reproducible zip artifacts under `dist/`, with browser-specific
   filenames such as `classic-web-search-chrome-vX.X.X.zip` and
   `classic-web-search-firefox-vX.X.X.zip`.

- [ ] Add a GitHub Release workflow.
   On `main` changes to `manifest.json`, build the extension zips, create a
   `vX.X.X` GitHub release if the tag does not already exist, and attach the
   artifacts.

- [ ] Add store deployment workflows.
   Publish release artifacts to Chrome Web Store and Firefox Add-ons using
   repository secrets. Keep Edge as a documented manual upload unless automated
   Edge publishing becomes worth the extra setup.

## Priority 4: User Controls

- [ ] Add a keyboard shortcut.
   Let users toggle the extension without opening the toolbar menu.

- [ ] Add context menu actions.
   Add actions for enable/disable, settings, keyboard shortcuts, rating, and
   bug reporting.

- [ ] Add an options page.
   Provide a small dashboard for current state, redirect count, version,
   release notes, and support links.

- [ ] Track redirect count accurately.
   Count successful automatic redirects and expose the value in storage and the
   options page.

## Priority 5: Repository Maintenance

- [ ] Improve README structure.
   Document browser support, how the redirect works, development workflow, and
   release process.

- [ ] Add contributing guidelines.
   Include local testing steps, browser-specific verification, and pull request
   expectations.

- [ ] Add issue-management workflows.
   Add stale issue handling, stale-response handling, and one-time label
   creation for repository triage.

- [ ] Add release checklist.
   Document the required version bump, release notes update, browser testing,
   and store verification steps.

## Parking Lot

- [ ] Analytics for install, toggle, and redirect events.
- [ ] Rating prompt after meaningful usage.
- [ ] Dark and light toolbar icon variants.
- [ ] Automated Edge Add-ons publishing.
