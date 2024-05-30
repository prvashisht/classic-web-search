let lastClicked = '';
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "clickWebSearch") {
    setTimeout(() => {
      document.querySelectorAll('div[role="navigation"] div[role="listitem"] a').forEach(async item => {
        let url = new URL(item.href);
        if (url.searchParams.get('udm') == 14 && message.query != lastClicked) {
          browser.runtime.sendMessage({ action: "clickWebSearch", success: true });
          lastClicked = message.query;
          item.click();
        }
      });
    }, 200)
  }
});
