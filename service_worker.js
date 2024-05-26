let legacyWebSearchSettings = {
  isWebSearchEnabled: false,
  lastChangedSearch: "",
};

let setExtensionUninstallURL = (settings) => {
  const encodedDebugData = encodeURIComponent(
    Object.keys(settings)
      .sort()
      .map((key) => `${key}: ${settings[key]}`)
      .join("\n")
  );
  chrome.runtime.setUninstallURL(
    `https://pratyushvashisht.com/legacywebsearch/uninstall?utm_source=browser&utm_medium=extension&utm_campaign=uninstall&debugData=${encodedDebugData}`
  );
};

let saveAndApplyExtensionDetails = details => {
  legacyWebSearchSettings = { ...legacyWebSearchSettings, ...details };

  chrome.storage.sync.set({ legacyWebSearchSettings });
  setExtensionUninstallURL(legacyWebSearchSettings);
  chrome.action.setBadgeText({
    text: legacyWebSearchSettings.isWebSearchEnabled ? "on" : "off",
  });
  
  chrome.action.setBadgeBackgroundColor({
    color: legacyWebSearchSettings.isWebSearchEnabled ? "#00FF00" : "#F00000",
  });
};

chrome.action.onClicked.addListener(() => {
  saveAndApplyExtensionDetails({
    isWebSearchEnabled: !legacyWebSearchSettings.isWebSearchEnabled,
  });
});

chrome.runtime.onInstalled.addListener(async installInfo => {
  let installDate, updateDate;
  if (installInfo.reason === "install") {
    installDate = new Date().toISOString();
  } else {
    updateDate = new Date().toISOString();
  }
  const platformInfo = await chrome.runtime.getPlatformInfo();
  let debugData = {
    ...platformInfo,
    agent: navigator.userAgent,
    locale: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    version: chrome.runtime.getManifest().version,
  };
  if (installDate) debugData.installDate = installDate;
  if (updateDate) debugData.updateDate = updateDate;
  const data = await chrome.storage.sync.get("legacyWebSearchSettings");
  if (!data.legacyWebSearchSettings) {
    saveAndApplyExtensionDetails(debugData);
    return;
  }
  saveAndApplyExtensionDetails({
    ...data.legacyWebSearchSettings,
    ...debugData,
    num_changes: data.legacyWebSearchSettings.num_changes || 0,
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const url = new URL(tab.url);
    if (url.pathname === '/search') {
      const query = url.searchParams.get('q');
      const udm = url.searchParams.get('udm');
      // If there is a query, it's different from the last one, web search is enabled, and udm is not set.
      // This doesn't switch to web search if the user clicks on another search type or 
      // switches back to default search with the same query.

      // udm parameter is set for different types of searches like image search, etc
      // for image search: udm is 2
      // for web search: udm is 14
      if (
          query
          && query !== legacyWebSearchSettings.lastChangedSearch
          && legacyWebSearchSettings.isWebSearchEnabled
          && !udm
      ) {
        chrome.tabs.sendMessage(tab.id, { action: "clickWebSearch", query }, (response) => {
          if (response && response.success) {
            saveAndApplyExtensionDetails({
              lastChangedSearch: query,
              num_changes: legacyWebSearchSettings.num_changes + 1,
            });
          }
        });
      } else if (query && query !== legacyWebSearchSettings.lastChangedSearch) {
        saveAndApplyExtensionDetails({ lastChangedSearch: query });
      }
    }
  }
});
