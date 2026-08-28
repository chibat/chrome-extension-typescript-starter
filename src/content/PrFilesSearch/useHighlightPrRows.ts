import { useEffect } from "react";

import { Files } from "../types";

import styles from "./PrFilesSearch.module.scss";

type PrWithMatchingFiles = {
  number: number;
  files: Files;
};

type TouchedRow = {
  element: HTMLElement;
  hadHighlightClass: boolean;
  previousTitle: string | null;
};

export function useHighlightPrRows(
  prsWithSelectedFiles: PrWithMatchingFiles[] | undefined,
) {
  useEffect(() => {
    const touchedRows: TouchedRow[] = [];

    prsWithSelectedFiles?.forEach(({ number, files }) => {
      const row = document.getElementById(`issue_${number}`);
      if (!row) return;

      touchedRows.push({
        element: row,
        hadHighlightClass: row.classList.contains(styles.highlightedPrRow),
        previousTitle: row.getAttribute("title"),
      });

      const filenames = Array.from(
        new Set(files.map(({ filename }) => filename)),
      );
      const label = filenames.length === 1 ? "file" : "files";

      row.classList.add(styles.highlightedPrRow);
      row.setAttribute(
        "title",
        `Contains selected ${label}: ${filenames.join(", ")}`,
      );
    });

    return () => {
      touchedRows.forEach(({ element, hadHighlightClass, previousTitle }) => {
        if (!hadHighlightClass) {
          element.classList.remove(styles.highlightedPrRow);
        }

        if (previousTitle === null) {
          element.removeAttribute("title");
        } else {
          element.setAttribute("title", previousTitle);
        }
      });
    };
  }, [prsWithSelectedFiles]);
}
