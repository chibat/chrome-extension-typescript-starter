import { toggleChristmasLights } from './christmaslights/christmaslights';
import { traverseAndConvert } from './bionic/bionic'

chrome.runtime.onMessage.addListener(function (msg: any, sender, sendResponse) {

  if (msg.type === 'christmasLights') {
    toggleChristmasLights(msg.enable);
    sendResponse("Toggled Christmas lights.");

  } else if (msg.type === 'changeBackground') {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else if (msg.action === 'addBionicReading') {
    sendResponse("Activated Bionic Reading");
    traverseAndConvert(document.body);
  } else {
    sendResponse("Unrecognized message.");
  }
});

// On script load, check the stored state
chrome.storage.sync.get(['christmasLights'], (result) => {
  toggleChristmasLights(result.christmasLights);
});
