export function handlePr() {
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
