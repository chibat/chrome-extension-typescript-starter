import { addChristmasLights } from './christmaslights/christmaslights'
import { traverseAndConvert } from './bionic/bionic'

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // Check for a specific message to trigger the Christmas lights
  if (msg.action === 'activateChristmasLights') {
    addChristmasLights();
    sendResponse("Activated Christmas lights.");
  } else if (msg.color) {
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
