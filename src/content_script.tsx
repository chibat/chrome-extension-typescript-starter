import { handlePr, handlePrs } from './content';
import { Settings, getSettings } from './services';

getSettings({
  onSuccess: handleContent,
  onError: () => alert("Couldn't load from chrome storage"),
});

function handleContent(settings: Settings) {
  const baseUiUrl = `${settings.ghBaseUrl.replace('/api/v3', '')}/${
    settings.org
  }/${settings.repo}`;
  const prsUiUrl = `${baseUiUrl}/pulls`;
  const prUiUrl = `${baseUiUrl}/pull`;

  if (window.location.href.startsWith(prsUiUrl)) handlePrs(settings);
  if (window.location.href.startsWith(prUiUrl)) handlePr();
}
