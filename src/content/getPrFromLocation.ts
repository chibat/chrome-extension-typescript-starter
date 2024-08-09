export function getPrFromLocation(): number | undefined {
  const [_, prNumber] =
    globalThis.window.location.pathname.match(/\/pull\/([0-9]+?)(\/|$)/) ?? [];
  return prNumber ? Number(prNumber) : undefined;
}
