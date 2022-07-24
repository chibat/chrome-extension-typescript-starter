// メッセージを受け取る
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const { action } = message;
  if (action === "GetVideoButtonClicked") {
    console.log(message.url);
    copyToClipboard(message.url);
    sendResponse();
  }
});

function copyToClipboard(copyString: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyString)
      .then(() => console.log(copyString));
  }
}
