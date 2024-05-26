chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clickWebSearch") {
    document.querySelectorAll('div[role="navigation"] div[role="listitem"]').forEach(async item => {
      if (item.textContent.trim() === "Web" && item.querySelector('a')) {
        await sendResponse({ success: true });
        item.querySelector('a').click();
      }
    });
  }
});
