import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [isLightsEnabled, setIsLightsEnabled] = useState(false);

  useEffect(() => {
    // On component mount, load the saved state
    chrome.storage.sync.get(["christmasLights"], (result) => {
      setIsLightsEnabled(result.christmasLights || false);
    });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update state and save to Chrome storage
    const newState = event.target.checked;
    setIsLightsEnabled(newState);
    chrome.storage.sync.set({ christmasLights: newState });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "christmasLights",
          enable: newState,
        });
      }
    });
  };

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: "changeBackground",
            color: "#555555",
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      }
    });
  };

  const addLights = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "activateChristmasLights" },
          function (response) {
            console.log(response);
          }
        );
      }
    });
  };

  const addBionicReading = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "addBionicReading" },
          function (response) {
            console.log(response);
          }
        );
      }
    });
  };

  return (
    <div className="bg-gray-100">
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
      <button
        onClick={() => setCount(count + 1)}
        style={{ marginRight: "5px" }}
      >
        count up
      </button>
      <button onClick={changeBackground}>change background</button>
      <input
        type="checkbox"
        id="lightsEnabledCheckbox"
        checked={isLightsEnabled}
        onChange={handleChange}
      />
      <label htmlFor="lightsEnabledCheckbox">Enable Christmas Lights</label>
      <button onClick={addLights}>add lights</button>
      <button onClick={addBionicReading}>add bionic reading</button>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
