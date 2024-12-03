chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "APPLY_AND_REFRESH") {
    const { cookie, tabId } = message;

    chrome.cookies
      .set(cookie)
      .then(() => {
        chrome.tabs.reload(tabId);
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error });
      });

    return true; // Keep the message channel open for async response
  }
});
