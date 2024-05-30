let lastClicked = '';
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clickWebSearch") {
    document.querySelectorAll('div[role="navigation"] div[role="listitem"] a').forEach(async item => {
      let url = new URL(item.href);
      if (url.searchParams.get('udm') == 14 && message.query != lastClicked) {
        await sendResponse({ success: true });
        lastClicked = message.query;
        item.click();
      }
    });
  }
});
