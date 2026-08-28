import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Files } from "../../types";
import { PrFilesSearch, Props } from "../PrFilesSearch";

const prs = [
  {
    number: 1,
    title: "Fix authentication",
    html_url: "https://github.com/test/repo/pull/1",
    labels: [
      { name: "bug", color: "d73a4a" },
      { name: "backend", color: "ffffff" },
    ],
  },
  {
    number: 2,
    title: "Update documentation",
    html_url: "https://github.com/test/repo/pull/2",
    labels: [
      { name: "documentation", color: "0075ca" },
      { name: "bug", color: "d73a4a" },
    ],
  },
  {
    number: 3,
    title: "Refactor components",
    html_url: "https://github.com/test/repo/pull/3",
    labels: [{ name: "frontend", color: "fbca04" }],
  },
] as unknown as Props["prs"];

const createFile = (filename: string) =>
  ({
    filename,
    sha: filename,
    additions: 1,
    deletions: 0,
    changes: 1,
    status: "modified",
    blob_url: `https://example.com/${filename}`,
    raw_url: `https://example.com/${filename}`,
    contents_url: `https://example.com/${filename}`,
  }) as Files[number];

const prFilesMap = new Map<number, Files>([
  [1, [createFile("src/auth.ts"), createFile("src/shared.ts")]],
  [2, [createFile("docs/auth.md"), createFile("src/shared.ts")]],
  [3, [createFile("src/component.tsx")]],
]);

async function renderOpenSearch() {
  const user = userEvent.setup();
  render(<PrFilesSearch prs={prs} prFilesMap={prFilesMap} />);
  await user.click(screen.getByPlaceholderText("Search for file in PRs"));
  return user;
}

describe("PrFilesSearch label filter", () => {
  test("renders deduplicated labels in alphabetical order", async () => {
    await renderOpenSearch();

    const badges = within(screen.getByTestId("LabelFilterBadges")).getAllByRole(
      "button",
    );

    expect(badges.map((badge) => badge.textContent)).toEqual([
      "backend",
      "bug",
      "documentation",
      "frontend",
    ]);
  });

  test("filters PRs by one selected label and clears it on a second click", async () => {
    const user = await renderOpenSearch();
    const bugBadge = screen.getByRole("button", { name: "bug" });

    await user.click(bugBadge);

    expect(bugBadge).toHaveAttribute("aria-pressed", "true");
    expect(bugBadge).toHaveClass("labelBadge__selected");
    expect(screen.getByText("1: Fix authentication")).toBeInTheDocument();
    expect(screen.getByText("2: Update documentation")).toBeInTheDocument();
    expect(
      screen.queryByText("3: Refactor components"),
    ).not.toBeInTheDocument();

    await user.click(bugBadge);

    expect(bugBadge).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("3: Refactor components")).toBeInTheDocument();
  });

  test("combines the label filter with the file search", async () => {
    const user = await renderOpenSearch();

    await user.click(screen.getByRole("button", { name: "bug" }));
    await user.type(
      screen.getByPlaceholderText("Search for file in PRs"),
      "docs",
    );

    expect(screen.queryByText("1: Fix authentication")).not.toBeInTheDocument();
    expect(screen.getByText("2: Update documentation")).toBeInTheDocument();
    expect(screen.getByText("docs/auth.md")).toBeInTheDocument();
  });

  test("shows an empty-state hint when the active filters match no PRs", async () => {
    const user = await renderOpenSearch();

    await user.click(screen.getByRole("button", { name: "frontend" }));
    await user.type(
      screen.getByPlaceholderText("Search for file in PRs"),
      "missing",
    );

    expect(
      screen.getByText("No PRs match the current filters."),
    ).toBeInTheDocument();
  });

  test("applies the selected label to PRs with selected files", async () => {
    const user = await renderOpenSearch();

    await user.click(screen.getAllByText("src/shared.ts")[0]);
    expect(screen.getByText("Prs With Selected Files")).toBeInTheDocument();
    expect(screen.getAllByText("1: Fix authentication")).toHaveLength(2);
    expect(screen.getAllByText("2: Update documentation")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "backend" }));

    expect(screen.getAllByText("1: Fix authentication")).toHaveLength(2);
    expect(
      screen.queryByText("2: Update documentation"),
    ).not.toBeInTheDocument();
  });
});
