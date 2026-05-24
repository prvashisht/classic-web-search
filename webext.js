const isFirefoxRuntime = (
  typeof browser !== "undefined"
  && /Firefox\//.test(navigator.userAgent)
);

const extensionApi = isFirefoxRuntime ? browser : chrome;

export const isFirefox = isFirefoxRuntime;
export const isChromium = !isFirefoxRuntime;

export const webext = {
  action: extensionApi.action,
  contextMenus: extensionApi.contextMenus,
  runtime: extensionApi.runtime,
  storage: extensionApi.storage,
  tabs: extensionApi.tabs,
  openExtensionPage: async () => {
    if (isFirefoxRuntime) {
      await extensionApi.tabs.create({ url: 'about:addons' });
      return;
    }

    await extensionApi.tabs.create({
      url: `chrome://extensions/?id=${extensionApi.runtime.id}`,
    });
  },
  openShortcutsPage: async () => {
    if (isFirefoxRuntime) {
      await extensionApi.tabs.create({ url: 'about:addons' });
      return;
    }

    await extensionApi.tabs.create({ url: 'chrome://extensions/shortcuts' });
  },
};
