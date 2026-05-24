import { webext } from './webext.js';

const SETTINGS_KEY = 'classicWebSearchSettings';
const DEFAULT_SETTINGS = {
  isWebSearchEnabled: false,
  num_changes: 0,
};

const statusLabel = document.querySelector('#status-label');
const stateSummary = document.querySelector('#state-summary');
const toggleButton = document.querySelector('#toggle-button');
const redirectCount = document.querySelector('#redirect-count');
const versionNumber = document.querySelector('#version-number');
const releaseNotesLink = document.querySelector('#release-notes-link');
const shortcutsButton = document.querySelector('#shortcuts-button');

let currentSettings = { ...DEFAULT_SETTINGS };

const formatCount = count => new Intl.NumberFormat().format(count || 0);

const getStoredSettings = async () => {
  const data = await webext.storage.sync.get(SETTINGS_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...(data[SETTINGS_KEY] || {}),
  };
};

const saveSettings = async settings => {
  const nextSettings = {
    ...currentSettings,
    ...settings,
  };
  await webext.storage.sync.set({ [SETTINGS_KEY]: nextSettings });
  currentSettings = nextSettings;
  render(currentSettings);
};

const render = settings => {
  const isEnabled = Boolean(settings.isWebSearchEnabled);
  document.body.classList.toggle('state-enabled', isEnabled);
  document.body.classList.toggle('state-disabled', !isEnabled);

  statusLabel.textContent = isEnabled ? 'Enabled' : 'Disabled';
  stateSummary.textContent = isEnabled
    ? 'Google searches open in the web-only results view.'
    : 'Google searches open with your browser default behavior.';
  toggleButton.textContent = isEnabled ? 'Disable' : 'Enable';
  toggleButton.disabled = false;
  redirectCount.textContent = formatCount(settings.num_changes);
};

const renderManifestDetails = () => {
  const manifest = webext.runtime.getManifest();
  versionNumber.textContent = manifest.version;
  releaseNotesLink.href = `https://github.com/prvashisht/classic-web-search/releases/tag/v${manifest.version}`;
};

const restore = async () => {
  currentSettings = await getStoredSettings();
  render(currentSettings);
};

toggleButton.addEventListener('click', async () => {
  toggleButton.disabled = true;
  try {
    await saveSettings({
      isWebSearchEnabled: !currentSettings.isWebSearchEnabled,
    });
  } catch (error) {
    console.error('Failed to save options', error);
    render(currentSettings);
  }
});

shortcutsButton.addEventListener('click', async () => {
  await webext.openShortcutsPage();
});

webext.storage.onChanged?.addListener((changes, areaName) => {
  if (areaName !== 'sync' || !changes[SETTINGS_KEY]) {
    return;
  }

  currentSettings = {
    ...DEFAULT_SETTINGS,
    ...(changes[SETTINGS_KEY].newValue || {}),
  };
  render(currentSettings);
});

renderManifestDetails();
restore().catch(error => {
  console.error('Failed to load options', error);
  statusLabel.textContent = 'Unavailable';
  stateSummary.textContent = 'Settings could not be loaded.';
});
