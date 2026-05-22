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
  chrome.runtime.setUninstallURL(
    `https://pratyushvashisht.com/classicwebsearch/uninstall?utm_source=browser&utm_medium=extension&utm_campaign=uninstall&debugData=${encodedDebugData}`
  );
};

let applyExtensionDetails = details => {
  classicWebSearchSettings = { ...classicWebSearchSettings, ...details };

  setExtensionUninstallURL(classicWebSearchSettings);
  chrome.action.setBadgeText({
    text: classicWebSearchSettings.isWebSearchEnabled ? "on" : "off",
  });

  chrome.action.setBadgeBackgroundColor({
    color: classicWebSearchSettings.isWebSearchEnabled ? "#00FF00" : "#F00000",
  });
};

let saveAndApplyExtensionDetails = async details => {
  applyExtensionDetails(details);
  await chrome.storage.sync.set({ classicWebSearchSettings });
};

let logExtensionDetailsSaveFailure = error => {
  console.error("Failed to save classic web search settings", error);
};

let restoreExtensionDetails = async () => {
  try {
    const data = await chrome.storage.sync.get("classicWebSearchSettings");
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

chrome.action.onClicked.addListener(async () => {
  await classicWebSearchSettingsReady;
  await saveAndApplyExtensionDetails({
    isWebSearchEnabled: !classicWebSearchSettings.isWebSearchEnabled,
  });
});

chrome.runtime.onInstalled.addListener(async installInfo => {
  await classicWebSearchSettingsReady;
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
  const data = await chrome.storage.sync.get("classicWebSearchSettings");
  if (!data.classicWebSearchSettings) {
    await saveAndApplyExtensionDetails(debugData);
    return;
  }
  await saveAndApplyExtensionDetails({
    ...data.classicWebSearchSettings,
    ...debugData,
    num_changes: data.classicWebSearchSettings.num_changes || 0,
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
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
    chrome.tabs.update(tabId, { url: url.toString() }, () => {
      if (chrome.runtime.lastError) return;

      saveAndApplyExtensionDetails({
        lastChangedSearch: query,
        num_changes: classicWebSearchSettings.num_changes + 1,
      }).catch(logExtensionDetailsSaveFailure);
    });
  } else if (query && query !== classicWebSearchSettings.lastChangedSearch) {
    saveAndApplyExtensionDetails({ lastChangedSearch: query })
      .catch(logExtensionDetailsSaveFailure);
  }
});
