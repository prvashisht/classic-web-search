import { webext } from './webext.js';

const CONTEXT_MENU_TOGGLE_ID = "toggle-classic-web-search";
const CONTEXT_MENU_MANAGE_ID = "manage-extension";
const CONTEXT_MENU_SHORTCUTS_ID = "manage-keyboard-shortcuts";
const CONTEXT_MENU_RATE_ID = "rate-classic-web-search";
const CONTEXT_MENU_SUPPORT_ID = "report-bug-or-support";
const RATE_REVIEW_URL = "https://vashis.ht/rd/classicwebsearch?from=classicwebsearch-extension-context_menu";
const SUPPORT_URL = "https://github.com/prvashisht/classic-web-search/issues/new";

let classicWebSearchSettings = {
  isWebSearchEnabled: false,
  lastChangedSearch: "",
  num_changes: 0,
};

let setExtensionUninstallURL = (settings) => {
  const encodedDebugData = encodeURIComponent(
    Object.keys(settings)
      .sort()
      .map((key) => `${key}: ${settings[key]}`)
      .join("\n")
  );
  const uninstallURL = `https://pratyushvashisht.com/classicwebsearch/uninstall?utm_source=browser&utm_medium=extension&utm_campaign=uninstall&debugData=${encodedDebugData}`;

  try {
    const result = webext.runtime.setUninstallURL(uninstallURL);
    if (result && typeof result.catch === 'function') {
      result.catch(error => {
        console.warn("Failed to set uninstall URL", error);
      });
    }
  } catch (error) {
    console.warn("Failed to set uninstall URL", error);
  }
};

let updateContextMenuState = () => {
  if (!webext.contextMenus?.update) {
    return;
  }

  try {
    const result = webext.contextMenus.update(CONTEXT_MENU_TOGGLE_ID, {
      checked: classicWebSearchSettings.isWebSearchEnabled,
    });
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  } catch (error) {
    // The menu may not exist yet during startup or immediately after install.
  }
};

let applyExtensionDetails = details => {
  classicWebSearchSettings = { ...classicWebSearchSettings, ...details };

  setExtensionUninstallURL(classicWebSearchSettings);
  webext.action.setBadgeText({
    text: classicWebSearchSettings.isWebSearchEnabled ? "on" : "off",
  });

  webext.action.setBadgeBackgroundColor({
    color: classicWebSearchSettings.isWebSearchEnabled ? "#00FF00" : "#F00000",
  });

  updateContextMenuState();
};

let saveAndApplyExtensionDetails = async details => {
  applyExtensionDetails(details);
  await webext.storage.sync.set({ classicWebSearchSettings });
};

let logExtensionDetailsSaveFailure = error => {
  console.error("Failed to save classic web search settings", error);
};

let restoreExtensionDetails = async () => {
  try {
    const data = await webext.storage.sync.get("classicWebSearchSettings");
    const savedSettings = data.classicWebSearchSettings;
    if (savedSettings) {
      applyExtensionDetails({
        ...savedSettings,
        num_changes: savedSettings.num_changes || 0,
      });
      return;
    }
  } catch (error) {
    console.error("Failed to restore classic web search settings", error);
  }
  applyExtensionDetails({});
};

let classicWebSearchSettingsReady = restoreExtensionDetails();

let createContextMenu = details => {
  try {
    webext.contextMenus.create(details);
  } catch (error) {
    console.warn("Failed to create context menu item", details.id, error);
  }
};

let buildContextMenus = async () => {
  if (!webext.contextMenus?.removeAll) {
    return;
  }

  try {
    const result = webext.contextMenus.removeAll();
    if (result && typeof result.then === 'function') {
      await result;
    }
  } catch (error) {
    console.warn("Failed to reset context menu", error);
  }

  createContextMenu({
    id: CONTEXT_MENU_TOGGLE_ID,
    type: "checkbox",
    title: "Enable Classic Web Search",
    contexts: ["action"],
    checked: classicWebSearchSettings.isWebSearchEnabled,
  });
  createContextMenu({
    id: CONTEXT_MENU_MANAGE_ID,
    title: "Open options",
    contexts: ["action"],
  });
  createContextMenu({
    id: CONTEXT_MENU_SHORTCUTS_ID,
    title: "Manage keyboard shortcuts",
    contexts: ["action"],
  });
  createContextMenu({
    id: CONTEXT_MENU_RATE_ID,
    title: "Rate / review Classic Web Search",
    contexts: ["action"],
  });
  createContextMenu({
    id: CONTEXT_MENU_SUPPORT_ID,
    title: "Report a bug / request support",
    contexts: ["action"],
  });
};

let contextMenusReady = Promise.resolve();
let scheduleBuildContextMenus = () => {
  contextMenusReady = contextMenusReady.then(buildContextMenus, buildContextMenus);
  return contextMenusReady;
};

classicWebSearchSettingsReady
  .then(scheduleBuildContextMenus)
  .catch(error => {
    console.warn("Failed to initialize context menus", error);
  });

let googleSearchHostnamePattern = /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/;
let httpUrlPattern = /^https?:\/\//i;

let getHttpTabUrl = tab => {
  if (!tab || typeof tab.url !== 'string' || !httpUrlPattern.test(tab.url)) {
    return null;
  }

  try {
    return new URL(tab.url);
  } catch (error) {
    return null;
  }
};

let isGoogleSearchPage = url => (
  googleSearchHostnamePattern.test(url.hostname) && url.pathname === '/search'
);

let hasExplicitSearchMode = url => (
  url.searchParams.has('udm') || url.searchParams.has('tbm')
);

let setClassicWebSearchEnabled = async isEnabled => {
  await classicWebSearchSettingsReady;
  await saveAndApplyExtensionDetails({
    isWebSearchEnabled: isEnabled,
  });
};

let toggleClassicWebSearch = async () => {
  await classicWebSearchSettingsReady;
  await setClassicWebSearchEnabled(!classicWebSearchSettings.isWebSearchEnabled);
};

webext.action.onClicked.addListener(async () => {
  await toggleClassicWebSearch();
});

webext.contextMenus.onClicked.addListener(async info => {
  await classicWebSearchSettingsReady;

  switch (info.menuItemId) {
    case CONTEXT_MENU_TOGGLE_ID:
      await setClassicWebSearchEnabled(
        typeof info.checked === 'boolean'
          ? info.checked
          : !classicWebSearchSettings.isWebSearchEnabled
      );
      break;
    case CONTEXT_MENU_MANAGE_ID:
      await webext.openOptionsPage();
      break;
    case CONTEXT_MENU_SHORTCUTS_ID:
      await webext.openShortcutsPage();
      break;
    case CONTEXT_MENU_RATE_ID:
      await webext.tabs.create({ url: RATE_REVIEW_URL });
      break;
    case CONTEXT_MENU_SUPPORT_ID:
      await webext.tabs.create({ url: SUPPORT_URL });
      break;
  }
});

webext.runtime.onInstalled.addListener(async installInfo => {
  await classicWebSearchSettingsReady;
  let installDate, updateDate;
  if (installInfo.reason === "install") {
    installDate = new Date().toISOString();
  } else {
    updateDate = new Date().toISOString();
  }
  const platformInfo = await webext.runtime.getPlatformInfo();
  let debugData = {
    ...platformInfo,
    agent: navigator.userAgent,
    locale: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    version: webext.runtime.getManifest().version,
  };
  if (installDate) debugData.installDate = installDate;
  if (updateDate) debugData.updateDate = updateDate;
  const data = await webext.storage.sync.get("classicWebSearchSettings");
  if (!data.classicWebSearchSettings) {
    await saveAndApplyExtensionDetails(debugData);
    await scheduleBuildContextMenus();
    return;
  }
  await saveAndApplyExtensionDetails({
    ...data.classicWebSearchSettings,
    ...debugData,
    num_changes: data.classicWebSearchSettings.num_changes || 0,
  });
  await scheduleBuildContextMenus();
});

webext.storage.onChanged?.addListener((changes, areaName) => {
  if (areaName !== 'sync' || !changes.classicWebSearchSettings) {
    return;
  }

  applyExtensionDetails({
    ...classicWebSearchSettings,
    ...(changes.classicWebSearchSettings.newValue || {}),
  });
});

webext.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await classicWebSearchSettingsReady;
  if (changeInfo.status !== 'complete') {
    return;
  }

  const url = getHttpTabUrl(tab);
  if (!url || !isGoogleSearchPage(url)) {
    return;
  }

  const query = url.searchParams.get('q');
  const udm = url.searchParams.get('udm');
  const alreadyClassicWebSearch = udm === '14';
  const explicitSearchModeSelected = hasExplicitSearchMode(url);
  // Only rewrite plain Google search pages. Existing udm/tbm modes represent
  // the user's selected search type, such as Web, Images, News, or Shopping.
  if (
      query
      && query !== classicWebSearchSettings.lastChangedSearch
      && classicWebSearchSettings.isWebSearchEnabled
      && !alreadyClassicWebSearch
      && !explicitSearchModeSelected
  ) {
    url.searchParams.set('udm', '14');
    try {
      await webext.tabs.update(tabId, { url: url.toString() });
    } catch (error) {
      return;
    }

    saveAndApplyExtensionDetails({
      lastChangedSearch: query,
      num_changes: classicWebSearchSettings.num_changes + 1,
    }).catch(logExtensionDetailsSaveFailure);
  } else if (query && query !== classicWebSearchSettings.lastChangedSearch) {
    saveAndApplyExtensionDetails({ lastChangedSearch: query })
      .catch(logExtensionDetailsSaveFailure);
  }
});
