chrome.storage.local
  .get(["pat", "org", "repo", "ghBaseUrl", "labelStyling"])
  .then((entries) => {
    const pullsApiUrl = `${entries.ghBaseUrl}/repos/${entries.org}/${entries.repo}/pulls`;
    const baseUiUrl = `${entries.ghBaseUrl.replace("/api/v3", "")}/${
      entries.org
    }/${entries.repo}`;
    const pullsUiUrl = `${baseUiUrl}/pulls`;
    const prUiUrl = `${baseUiUrl}/pull`;

    if (window.location.href.startsWith(pullsUiUrl)) {
      fetch(pullsApiUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${entries.pat}`,
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

    if (window.location.href.startsWith(prUiUrl)) {
      // getCurrentPr.ts
      // https://github.com/aklinker1/github-better-line-counts/blob/main/src/utils/getCurrentPr.ts

      const [_, prNumber] =
        window.location.pathname.match(/\/pull\/([0-9]+?)(\/|$)/) ?? [];
      // return prNumber ? Number(prNumber) : undefined;

      // const repo = getCurrentRepo();
      // const owner = getCurrentOwner();
      // if (!repo || !owner) return;

      // const pr = getCurrentPr();
      // if (pr) return replaceCount({ type: "pr", repo, owner, pr }, PrDiff);

      // https://github.com/aklinker1/github-better-line-counts/blob/main/src/utils/github/api.ts

      // https://github.com/aklinker1/github-better-line-counts/blob/main/src/utils/github/service.ts
    }
  });
