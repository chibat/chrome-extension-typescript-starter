import { Octokit } from "@octokit/rest";
import { Config } from "../services";

export async function handlePrs(config: Config) {
  const octokit = new Octokit({
    auth: config.pat,
    baseUrl: config.ghBaseUrl,
    log: {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error,
    },
  });
  try {
    const { data } = await octokit.pulls.list({
      owner: config.org,
      repo: config.repo,
      state: "open",
      per_page: 100,
      page: 1,
    });

    const prs = data.map((pr) => ({
      prNumber: pr.number,
      headRef: pr.head.ref,
      baseRef: pr.base.ref,
    }));

    const prRows = document.querySelectorAll("div[id^=issue_]");
    prRows.forEach((prRow) => {
      const prNumber = prRow.id.split("_")[1];
      const prData = prs.find((pr) => pr.prNumber === parseInt(prNumber));
      if (prData) {
        const text = `${prData.baseRef} <-- ${prData.headRef}`;
        const spanEl = document.createElement("span");
        spanEl.textContent = text;
        spanEl.classList.add("IssueLabel");
        spanEl.classList.add("hx_IssueLabel");
        prRow.children[0].children[2].appendChild(spanEl);
      }
    });
  } catch (err) {
    alert("Error fetching PR data. Check console");
    console.error(err);
  }
}
