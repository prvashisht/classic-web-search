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
  browser.runtime.setUninstallURL(
    `https://pratyushvashisht.com/classicwebsearch/uninstall?utm_source=browser&utm_medium=extension&utm_campaign=uninstall&debugData=${encodedDebugData}`
  );
};

let saveAndApplyExtensionDetails = details => {
  classicWebSearchSettings = { ...classicWebSearchSettings, ...details };

  browser.storage.sync.set({ classicWebSearchSettings });
  setExtensionUninstallURL(classicWebSearchSettings);
  browser.browserAction.setBadgeText({
    text: classicWebSearchSettings.isWebSearchEnabled ? "on" : "off",
  });
  
  browser.browserAction.setBadgeBackgroundColor({
    color: classicWebSearchSettings.isWebSearchEnabled ? "#00FF00" : "#F00000",
  });
};

browser.browserAction.onClicked.addListener(() => {
  saveAndApplyExtensionDetails({
    isWebSearchEnabled: !classicWebSearchSettings.isWebSearchEnabled,
  });
});

browser.runtime.onInstalled.addListener(async installInfo => {
  let installDate, updateDate;
  if (installInfo.reason === "install") {
    installDate = new Date().toISOString();
  } else {
    updateDate = new Date().toISOString();
  }
  const platformInfo = await browser.runtime.getPlatformInfo();
  let debugData = {
    ...platformInfo,
    agent: navigator.userAgent,
    locale: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    version: browser.runtime.getManifest().version,
  };
  if (installDate) debugData.installDate = installDate;
  if (updateDate) debugData.updateDate = updateDate;
  const data = await browser.storage.sync.get("classicWebSearchSettings");
  if (!data.classicWebSearchSettings) {
    saveAndApplyExtensionDetails(debugData);
    return;
  }
  saveAndApplyExtensionDetails({
    ...data.classicWebSearchSettings,
    ...debugData,
    num_changes: data.classicWebSearchSettings.num_changes || 0,
  });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
          && query !== classicWebSearchSettings.lastChangedSearch
          && classicWebSearchSettings.isWebSearchEnabled
          && !udm
      ) {
        browser.tabs.sendMessage(tab.id, { action: "clickWebSearch", query });
      } else if (query && query !== classicWebSearchSettings.lastChangedSearch) {
        saveAndApplyExtensionDetails({ lastChangedSearch: query });
      }
    }
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (message?.action === "clickWebSearch" && message?.success) {
    classicWebSearchSettings.num_changes++;
    saveAndApplyExtensionDetails({
      lastChangedSearch: query,
    });
  }
});
