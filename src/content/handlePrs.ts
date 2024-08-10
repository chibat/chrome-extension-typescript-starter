import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { Settings } from '../services';
import { Spinner } from './spinner';

export async function handlePrs(settings: Settings) {
  const octokit = new Octokit({
    auth: settings.pat,
    baseUrl: settings.ghBaseUrl,
  });

  try {
    Spinner.showSpinner(
      '#js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div'
    );
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
    Spinner.hideSpinner();
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
