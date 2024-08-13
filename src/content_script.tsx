import { handlePr, handlePrs } from "./content";
import { autoFilter } from "./content/autoFilter";
import { Settings, getSettings } from "./services";

getSettings({
  onSuccess: handleContent,
  onError: () => alert("Couldn't load from chrome storage"),
});

function handleContent(settings: Settings) {
  const baseUiUrl = `${settings.ghBaseUrl.replace("/api/v3", "")}/${
    settings.org
  }/${settings.repo}`;
  const prsUiUrl = `${baseUiUrl}/pulls`;
  const prUiUrl = `${baseUiUrl}/pull`;

  if (window.location.href.startsWith(prsUiUrl)) {
    handlePrs(settings);
    autoFilter(prsUiUrl, settings.autoFilter);
  }
  if (window.location.href.startsWith(prUiUrl)) handlePr(settings);
}
