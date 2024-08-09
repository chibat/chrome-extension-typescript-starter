import { handlePr, handlePrs } from "./content";
import { Config, getConfig } from "./services";

getConfig({
  onSuccess: handleContent,
  onError: () => alert("Couldn't load from chrome storage"),
});

function handleContent(config: Config) {
  const baseUiUrl = `${config.ghBaseUrl.replace("/api/v3", "")}/${config.org}/${
    config.repo
  }`;
  const prsUiUrl = `${baseUiUrl}/pulls`;
  const prUiUrl = `${baseUiUrl}/pull`;

  if (window.location.href.startsWith(prsUiUrl)) handlePrs(config);
  if (window.location.href.startsWith(prUiUrl)) handlePr();
}




