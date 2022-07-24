chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (isNicoTarget(details) || isOpenrecTarget(details)) {
      saveVideoURL(details);
    }
  },
  {
    urls: [
      "https://*.dmc.nico/*",
      "https://*.openrec.tv/*",
      "https://*.cloudfront.net/*",
    ],
  },
  []
);

function isNicoTarget(
  details: chrome.webRequest.WebRequestBodyDetails
): boolean {
  if (!(details.url.includes("dmc.nico") && details.method === "GET")) {
    return false;
  }
  const hlsTarget = details.url.includes("master.m3u8");
  const htmlTarget = details.type === "media";
  return hlsTarget || htmlTarget;
}

function isOpenrecTarget(
  details: chrome.webRequest.WebRequestBodyDetails
): boolean {
  return details.url.includes("playlist.m3u8");
}

function saveVideoURL(details: chrome.webRequest.WebRequestBodyDetails) {
  console.log({ [`videoURL-${details.tabId}`]: details.url });
  chrome.storage.local.set({ [`videoURL-${details.tabId}`]: details.url });
}

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.tabs.query({ windowId: removeInfo.windowId }, (tabs) => {
    let removeTabs = tabs.slice();
    let keys: string[] = [`videoURL-${tabId}`];
    if (removeInfo.isWindowClosing) {
      keys = removeTabs
        .map((e) => e.id)
        .flatMap((e) => e ?? [])
        .map((e) => `videoURL-${e}`);
    }
    chrome.storage.local
      .remove(keys)
      .then(() => console.log("removed: ", keys));
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.query(
    {
      active: true,
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    },
    (tabs) => {
      const currentTab = tabs.shift();
      if (!currentTab) {
        return;
      }

      let url = "";
      // niconico
      if (isLocalData(currentTab.url)) {
        chrome.storage.local.get(`videoURL-${currentTab.id}`, (data) => {
          url = data[`videoURL-${currentTab.id}`];
          console.log(url, currentTab.id);
          sendUrlToContent(tab, url);
        });
      } else {
        // YouTube ・ Twitch
        url = formatURL(currentTab.url);
        sendUrlToContent(tab, url);
      }
    }
  );
});

function isYoutube(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return url.includes("https://www.youtube.com/watch");
}

function isLocalData(tabURL: string | undefined): boolean {
  if (!tabURL) {
    return false;
  }
  const search = [
    "https://www.nicovideo.jp/watch/",
    "https://live.nicovideo.jp/watch/lv",
    "https://www.openrec.tv/",
  ];
  return search.some((e) => tabURL.includes(e));
}

function formatURL(url: string | undefined) {
  if (!url) {
    return "";
  }
  let formattedURL = url;
  if (isYoutube(url)) {
    const params = new URL(url).searchParams;
    const videoId = params.get("v");
    formattedURL = `https://youtu.be/${videoId}`;
  }
  return formattedURL;
}

function sendUrlToContent(
  tab: chrome.tabs.Tab,
  url: string | undefined | null
) {
  if (!(tab.id && url)) {
    return;
  }
  chrome.tabs.sendMessage(
    tab.id,
    { action: "GetVideoButtonClicked", url: url },
    () => {}
  );
}
