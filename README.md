# Classic Web Search for Google

[![Version](https://img.shields.io/github/manifest-json/v/prvashisht/classic-web-search?label=Version)](https://github.com/prvashisht/classic-web-search/blob/main/manifest.json)

This browser extension automatically redirects your Google searches to the classic web-only results view.

## Features

- **Classic Web Search for Google:** Automatically redirects your Google searches to the classic web-only results view.
- **Dynamic Search:** The extension only works when the search query changes, allowing the user to switch to any other search type within the same query.
- **Toolbar Toggle:** Easily enable or disable the extension with a single click from the extension icon.
- **Keyboard Shortcut:** Toggle the extension with **Alt+Shift+W**. The shortcut can be remapped in your browser's extension shortcut settings.
- **Context Menu Controls:** Right-click the extension icon to toggle the extension, manage the extension, manage shortcuts, rate/review the extension, or report a bug/request support.

## Installation

You can install the extension from the [respective browsers' Web Store](https://vashis.ht/rd/classicwebsearch?from=github-readme) or follow these steps for local development:

1. Clone the repository:
```
git clone
```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable `Developer mode` in the top right corner.

4. Click on `Load unpacked` and select the cloned repository folder.

## Usage

- Click the extension icon to turn Classic Web Search on or off.
- Press **Alt+Shift+W** to toggle the extension without opening the toolbar.
- Right-click the extension icon to access the toggle, extension management page, keyboard shortcut settings, review link, and support link.

### Keyboard shortcut remap

- **Chrome / Edge**: `chrome://extensions/shortcuts`
- **Firefox**: `about:addons` -> Extensions -> Classic Web Search for Google -> Manage

## Files

- **`manifest.json`**: Contains metadata about the extension, including permissions, icons, and scripts.
- **`service_worker.js`**: Manages the extension behavior in the background, including badge text, color, toggle controls, context menu actions, and Google Search URL redirects.

## How to Contribute

Contributions are welcome! Here's how you can get involved:

1. Fork the repository and create your branch from `master`.
2. Make your changes and test thoroughly.
3. Open a pull request, describing the changes you made.
4. Discuss your changes with the community.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) when contributing.

## Roadmap

Planned improvements are tracked in [ROADMAP.md](ROADMAP.md).
