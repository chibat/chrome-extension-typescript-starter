import { Config } from "../services";

export function handlePrs(config: Config, pullsApiUrl: string) {
  fetch(pullsApiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.pat}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // @ts-ignore
      const mapped = data.map((d) => ({
        prNumber: d.number,
        headRef: d.head.ref,
        baseRef: d.base.ref,
      }));

      const prRows = document.querySelectorAll("div[id^=issue_]");
      prRows.forEach((prRow) => {
        const prNumber = prRow.id.split("_")[1];
        const prData = mapped.find(
          // @ts-ignore
          (d) => d.prNumber === parseInt(prNumber)
        );
        if (prData) {
          const text = `${prData.baseRef} <-- ${prData.headRef}`;
          const spanEl = document.createElement("span");
          spanEl.textContent = text;
          spanEl.classList.add("IssueLabel");
          spanEl.classList.add("hx_IssueLabel");
          prRow.children[0].children[2].appendChild(spanEl);
        }
      });
    })
    .catch((e) => {
      alert("Error fetching PR data. Check console");
      console.error(e);
    });
}
