import { Octokit } from '@octokit/rest';
import { Settings } from '../services';
import { getPrFromLocation } from './getPrFromLocation';

const BLACKLIST = ['package-lock.json'];

export async function handlePr(settings: Settings) {
  const prNumber = getPrFromLocation();

  if (!prNumber) return;

  const octokit = new Octokit({
    auth: settings.pat,
    baseUrl: settings.ghBaseUrl,
  });

  let totalLinesAdded = 0;
  let totalLinesRemoved = 0;
  const per_page = 100;
  let page = 1;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const { data: files } = await octokit.pulls.listFiles({
        owner: settings.org,
        repo: settings.repo,
        pull_number: prNumber,
        per_page,
        page,
      });

      files.forEach((file) => {
        if (BLACKLIST.some((name) => file.filename.includes(name))) return;
        totalLinesAdded += file.additions;
        totalLinesRemoved += file.deletions;
      });

      if (files.length < per_page) {
        hasNextPage = false;
      } else {
        page++;
      }
    }

    const linesAddedEl = document.querySelector<HTMLElement>(
      '#diffstat > span.color-fg-success'
    );
    const addedClone = linesAddedEl?.cloneNode(true);
    if (!addedClone) return;
    addedClone.textContent = `+ ${totalLinesAdded}`;
    linesAddedEl?.parentNode?.insertBefore(addedClone, linesAddedEl);

    const linesRemovedEl = document.querySelector<HTMLElement>(
      '#diffstat > span.color-fg-danger'
    );
    const removedClone = linesRemovedEl?.cloneNode(true);
    if (!removedClone) return;
    removedClone.textContent = `- ${totalLinesRemoved}`;
    linesRemovedEl?.parentNode?.insertBefore(removedClone, linesRemovedEl);

    linesAddedEl && (linesAddedEl.style['fontSize'] = '8px');
    linesAddedEl && (linesAddedEl.style['verticalAlign'] = 'sub');
    linesRemovedEl && (linesRemovedEl.style['fontSize'] = '8px');
    linesRemovedEl && (linesRemovedEl.style['verticalAlign'] = 'sub');
  } catch (error) {
    console.error('Error fetching pull request files:', error);
  }
}

// const repo = getCurrentRepo();
// const owner = getCurrentOwner();
// if (!repo || !owner) return;

// const pr = getCurrentPr();
// if (pr) return replaceCount({ type: "pr", repo, owner, pr }, PrDiff);

// https://github.com/aklinker1/github-better-line-counts/blob/main/src/utils/github/api.ts

// https://github.com/aklinker1/github-better-line-counts/blob/main/src/utils/github/service.ts
