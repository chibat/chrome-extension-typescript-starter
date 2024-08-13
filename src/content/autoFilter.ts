import { AutoFilter } from "../services";

export async function autoFilter(baseUiUrl: string, filter: AutoFilter) {
  if (window.location.href.includes("?q=")) return;
  window.location.replace(`${baseUiUrl}?q=${filter.filter}`);

  document.addEventListener("DOMContentLoaded", () => {
    const link = document.getElementById("pull-requests-tab");

    if (link) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = baseUiUrl + filter.filter;
      });
    }
  });
}
