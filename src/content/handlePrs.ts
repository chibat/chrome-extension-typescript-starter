import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { Settings } from '../services';

export async function handlePrs(settings: Settings) {
  const octokit = new Octokit({
    auth: settings.pat,
    baseUrl: settings.ghBaseUrl,
  });

  try {
    showSpinner();
    const { data: prs } = await octokit.pulls.list({
      owner: settings.org,
      repo: settings.repo,
      state: 'open',
      per_page: 100,
      page: 1,
    });

    const prRows = document.querySelectorAll('div[id^=issue_]');
    prRows.forEach((prRow) => {
      const [, prNumber] = prRow.id.split('_');
      const prData = prs.find((pr) => pr.number === parseInt(prNumber));
      addLabel(prData, prRow);
    });
  } catch (err) {
    alert('Error fetching PR data. Check console');
    console.error(err);
  } finally {
    hideSpinner();
  }
}

function addLabel(
  prData:
    | RestEndpointMethodTypes['pulls']['list']['response']['data'][number]
    | undefined,
  prRow: Element
) {
  if (!prData) return;
  const text = `${prData.base.ref} <-- ${prData.head.ref}`;
  const spanEl = document.createElement('span');
  spanEl.textContent = text;
  spanEl.classList.add('IssueLabel');
  spanEl.classList.add('hx_IssueLabel');
  prRow.children[0].children[2].appendChild(spanEl);
}

function showSpinner() {
  // document.querySelector("#js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div")
  let loadingOverlay = document.querySelector('.ghuibooster__overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('ghuibooster__hidden');
    return;
  }

  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .ghuibooster__overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
      
    .ghuibooster__overlay.ghuibooster__hidden {
        display: none;
    }

    .ghuibooster__spinner {
      border: 12px solid #f3f3f3;
      border-top: 12px solid #0d1318;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      animation: ghuibooster__spin 2s linear infinite;
    }

    @keyframes ghuibooster__spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);

  loadingOverlay = document.createElement('div');
  loadingOverlay.classList.add('ghuibooster__overlay');

  const loadingSpinner = document.createElement('div');
  loadingSpinner.classList.add('ghuibooster__spinner');

  loadingOverlay.appendChild(loadingSpinner);
  const body = document.querySelector('body');
  body?.appendChild(loadingOverlay);
}

function hideSpinner() {
  const loadingOverlay = document.querySelector('.ghuibooster__overlay');
  loadingOverlay?.classList.add('ghuibooster__hidden');
}
