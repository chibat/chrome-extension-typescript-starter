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
  let loadingSpinner = document.querySelector('.ghuibooster__spinner');
  if (loadingSpinner) {
    loadingSpinner.classList.remove('ghuibooster__hidden');
    return;
  }
  injectCSS();
  createSpinner(loadingSpinner);
}

function injectCSS() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    .ghuibooster__spinner.ghuibooster__hidden {
        display: none;
    }
    .ghuibooster__spinner {
      border: 2px solid #f3f3f3;
      border-top: 2px solid #0d1318;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: ghuibooster__spin .7s linear infinite;
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 1rem;
    }
    @keyframes ghuibooster__spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(style);
}

function createSpinner(loadingSpinner: Element | null) {
  const parentEl = document.querySelector(
    '#js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div'
  );
  loadingSpinner = document.createElement('div');
  loadingSpinner.classList.add('ghuibooster__spinner');
  parentEl?.appendChild(loadingSpinner);
  return loadingSpinner;
}

function hideSpinner() {
  const loadingOverlay = document.querySelector('.ghuibooster__spinner');
  loadingOverlay?.classList.add('ghuibooster__hidden');
}
