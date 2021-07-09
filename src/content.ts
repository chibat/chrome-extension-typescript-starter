chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    // eslint-disable-next-line no-console
    console.log('Receive color = ' + msg.color)
    document.body.style.backgroundColor = msg.color
    sendResponse('Change color to ' + msg.color)
  } else {
    sendResponse('Color message is none.')
  }
})
