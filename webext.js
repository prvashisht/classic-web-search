const isFirefoxRuntime = (
  typeof browser !== "undefined"
  && typeof browser.runtime?.getManifest === "function"
);

const extensionApi = isFirefoxRuntime ? browser : chrome;

export const isFirefox = isFirefoxRuntime;
export const isChromium = !isFirefoxRuntime;

export const webext = {
  action: extensionApi.action,
  runtime: extensionApi.runtime,
  storage: extensionApi.storage,
  tabs: extensionApi.tabs,
};
