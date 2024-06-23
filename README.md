# Web Only (Classic) Google Search Chrome Extension

[![Version](https://img.shields.io/badge/Version-1.2-blue.svg)]()

This Chrome extension automatically redirects your Google searches to the classic web-only version of Google Search.

## Features

- **Web Only Google Search:** Automatically redirects your Google searches to the classic web-only version.
- **Dynamic Search:** The extension only works when the search query changes, allowing the user to switch to any other search type within the same query.
- **Toggle Feature:** Easily enable or disable the extension with a single click from the extension icon.

## Installation

You can install the extension from the [respective browsers' Web Store](https://vashis.ht/rd/classicwebsearch?from=github-readme) or follow these steps for local development:

1. Clone the repository:
```
git clone
```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable `Developer mode` in the top right corner.

4. Click on `Load unpacked` and select the cloned repository folder.

## Files

- **`manifest.json`**: Contains metadata about the extension, including permissions, icons, and scripts.
- **`content.js`**: Handles the content script that interacts with Google Search pages.
- **`service_worker.js`**: Manages the extension behavior in the background, including badge text and color.

## How to Contribute

Contributions are welcome! Here's how you can get involved:

1. Fork the repository and create your branch from `master`.
2. Make your changes and test thoroughly.
3. Open a pull request, describing the changes you made.
4. Discuss your changes with the community.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) when contributing.
