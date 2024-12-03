import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Box,
  Button,
  Text,
  ActionList,
  ActionMenu,
  ThemeProvider,
  BaseStyles,
  TextInput,
} from "@primer/react";
import { TrashIcon, CopyIcon } from "@primer/octicons-react";

type Cookie = chrome.cookies.Cookie;
type Tab = chrome.tabs.Tab;

type Props = {
  cookie: Cookie;
  onApply: (targetTab: Tab) => void;
  onDelete: () => void;
};

const CookieItem = ({ cookie, onApply, onDelete }: Props) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [value, setValue] = useState(cookie.value);

  const handleApplyClick = () => {
    chrome.tabs.query({}, (allTabs) => {
      setTabs(allTabs.filter((tab) => tab.url && tab.id));
    });
  };

  const handleTabSelect = (tab: Tab) => {
    onApply(tab);
    setTabs([]);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      p={2}
      borderBottom="1px solid"
      borderColor="border.default"
    >
      <Box flex={1} mr={3} maxWidth="200px">
        <Text
          as="p"
          fontWeight="bold"
          mb={1}
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {cookie.name}
        </Text>
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Cookie value"
          block
          sx={{
            width: "100%",
          }}
        />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        flexShrink={0}
        height="32px"
        sx={{
          marginTop: "24px",
        }}
      >
        <Button
          variant="invisible"
          onClick={handleCopy}
          aria-label="Copy cookie value"
          sx={{ mr: 2 }}
        >
          <CopyIcon />
        </Button>
        <ActionMenu>
          <ActionMenu.Button onClick={handleApplyClick}>
            Apply to Tab
          </ActionMenu.Button>
          <ActionMenu.Overlay width="medium">
            <Box sx={{ height: "200px", overflowY: "auto" }}>
              <ActionList>
                {tabs.map((tab) => (
                  <ActionList.Item
                    key={tab.id}
                    onSelect={() => handleTabSelect(tab)}
                    sx={{
                      minWidth: "200px",
                      maxWidth: "300px",
                    }}
                  >
                    {tab.title || "Untitled"}
                  </ActionList.Item>
                ))}
              </ActionList>
            </Box>
          </ActionMenu.Overlay>
        </ActionMenu>
        <Box ml={2}>
          <Button variant="danger" onClick={onDelete}>
            <TrashIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const CookieManager = () => {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loadCookies = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.url) {
        setCurrentUrl(tab.url);
        const url = new URL(tab.url);
        chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
          if (chrome.runtime.lastError) {
            setError(
              chrome.runtime.lastError.message || "Unknown error occurred"
            );
          } else {
            setCookies(cookies);
          }
        });
      } else {
        setError("No active tab found or URL is undefined");
      }
    });
  };

  React.useEffect(() => {
    loadCookies();
  }, []);

  const handleApplyCookie = async (cookie: Cookie, targetTab: Tab) => {
    if (!targetTab.id || !targetTab.url) return;

    try {
      const targetUrl = new URL(targetTab.url);
      const newCookie: chrome.cookies.SetDetails = {
        url: targetUrl.toString(),
        name: cookie.name,
        value: cookie.value,
        domain: targetUrl.hostname,
        path: "/",
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
      };

      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "APPLY_AND_REFRESH",
            cookie: newCookie,
            tabId: targetTab.id,
          },
          (response) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(response.error);
            }
          }
        );
      });

      await chrome.tabs.update(targetTab.id, { active: true });
    } catch (err) {
      console.error("Error applying cookie:", err);
      setError(err instanceof Error ? err.message : "Failed to apply cookie");
    }
  };

  const handleDeleteCookie = async (cookie: Cookie) => {
    if (!currentUrl) return;

    try {
      const url = new URL(currentUrl);
      await chrome.cookies.remove({
        url: url.toString(),
        name: cookie.name,
      });
      loadCookies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete cookie");
    }
  };

  return (
    <Box
      bg="canvas.default"
      style={{
        height: "600px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box p={3} flex={1} overflowY="auto">
        <Text as="h1" fontSize={3} mb={3}>
          Let's Cookie!
        </Text>
        <Text as="h3" color="fg.muted">
          {currentUrl ? `${new URL(currentUrl).hostname}` : ""}
        </Text>
        {error && (
          <Text as="p" color="danger.fg" mb={3}>
            {error}
          </Text>
        )}
        {cookies.length === 0 ? (
          <Text as="p" color="fg.subtle">
            No cookies found for this domain
          </Text>
        ) : (
          <Box>
            {cookies.map((cookie) => (
              <CookieItem
                key={cookie.name}
                cookie={cookie}
                onApply={(tab) => handleApplyCookie(cookie, tab)}
                onDelete={() => handleDeleteCookie(cookie)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const root = createRoot(document.getElementById("root")!);

// Check system theme
const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

root.render(
  <React.StrictMode>
    <ThemeProvider dayScheme={darkMode ? "dark" : "light"} preventSSRMismatch>
      <BaseStyles>
        <CookieManager />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>
);
