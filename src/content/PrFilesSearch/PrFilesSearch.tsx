import { RestEndpointMethodTypes } from "@octokit/rest";
import { Text } from "@primer/react";
import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { cns } from "ts-type-safe";
import { ClosePopupButton, SearchInput } from "../../components";

import { Files } from "../types";

import styles from "./PrFilesSearch.module.scss";

type PrWithFiles = {
  title: string;
  url: string;
  files: Files;
};

type PrLabel = {
  name: string;
  color: string;
};

export type Props = {
  prs: RestEndpointMethodTypes["pulls"]["list"]["response"]["data"];
  prFilesMap: Map<number, Files>;
};

export const PrFilesSearch: React.FC<Props> = ({ prs, prFilesMap }) => {
  const [filter, filterSet] = useState<Set<string>>(new Set());
  const [isOpen, isOpenSet] = useState(false);
  const [searchValue, searchValueSet] = useState("");
  const [selectedLabel, selectedLabelSet] = useState<string>();
  const deferredSearchValue = useDeferredValue(searchValue);

  const availableLabels = useMemo(() => {
    const labels = new Map<string, PrLabel>();

    prs.forEach((pr) => {
      if (!prFilesMap.has(pr.number)) return;

      pr.labels.forEach((label) => {
        if (!label.name) return;
        labels.set(label.name.toLowerCase(), {
          name: label.name,
          color: label.color,
        });
      });
    });

    return Array.from(labels.values()).sort((labelA, labelB) =>
      labelA.name.localeCompare(labelB.name),
    );
  }, [prFilesMap, prs]);

  const prHasSelectedLabel = useCallback(
    (pr: Props["prs"][number]) =>
      !selectedLabel ||
      pr.labels.some(
        (label) => label.name.toLowerCase() === selectedLabel.toLowerCase(),
      ),
    [selectedLabel],
  );

  const allFiles = useMemo(() => {
    const files: PrWithFiles[] = [];
    prFilesMap.forEach((filesData, prNumber) => {
      const prData = prs.find((pr) => pr.number === prNumber);
      if (!prData || !prHasSelectedLabel(prData)) return;
      files.push({
        title: `${prData.number}: ${prData.title}`,
        url: `${prData.html_url}/files`,
        files: filesData,
      });
    });
    return files;
  }, [prFilesMap, prHasSelectedLabel, prs]);

  const getMatchingPrs = useCallback(
    // OR: returns PRs that match any of the terms
    // AND: returns PRs that match all of the terms
    (terms: string[], filter: "OR" | "AND") => {
      const matchingMap: PrWithFiles[] = [];

      prFilesMap.forEach((files, prNumber) => {
        const prData = prs.find((pr) => pr.number === prNumber);
        if (!prData || !prHasSelectedLabel(prData)) return;

        const matchingFiles =
          filter === "AND"
            ? terms.reduce((currentFiles, term) => {
                return currentFiles.filter((file) =>
                  file.filename.toLowerCase().includes(term.toLowerCase()),
                );
              }, files)
            : terms.reduce((currentFiles, term) => {
                return currentFiles.concat(
                  files.filter((file) =>
                    file.filename.toLowerCase().includes(term.toLowerCase()),
                  ),
                );
              }, [] as Files);

        if (matchingFiles.length > 0) {
          matchingMap.push({
            title: `${prData.number}: ${prData.title}`,
            url: `${prData.html_url}/files`,
            files: matchingFiles,
          });
        }
      });
      return matchingMap;
    },
    [prFilesMap, prHasSelectedLabel, prs],
  );

  const resultsList = useMemo(() => {
    if (!isOpen) return undefined;

    const terms = deferredSearchValue
      .trim()
      .toLowerCase()
      .split(" ")
      .filter(Boolean);

    return terms.length === 0 ? allFiles : getMatchingPrs(terms, "AND");
  }, [allFiles, deferredSearchValue, getMatchingPrs, isOpen]);

  const prsWithSelectedFiles = useMemo(
    () => (filter.size ? getMatchingPrs(Array.from(filter), "OR") : undefined),
    [filter, getMatchingPrs],
  );

  return (
    <>
      <SearchInput
        label="Search for file in PRs"
        name="search"
        onChange={searchValueSet}
        onFocus={(value) => {
          searchValueSet(value);
          isOpenSet(true);
        }}
      />
      <ResultsPopup
        availableLabels={availableLabels}
        filter={filter}
        filterSet={filterSet}
        isOpen={isOpen}
        isOpenSet={isOpenSet}
        selectedLabel={selectedLabel}
        selectedLabelSet={selectedLabelSet}
        resultsList={resultsList}
        prsWithSelectedFiles={prsWithSelectedFiles}
      />
    </>
  );
};

const ResultsPopup: React.FC<{
  availableLabels: PrLabel[];
  filter: Set<string>;
  filterSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  isOpen: boolean;
  isOpenSet: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLabel: string | undefined;
  selectedLabelSet: React.Dispatch<React.SetStateAction<string | undefined>>;
  resultsList: PrWithFiles[] | undefined;
  prsWithSelectedFiles: PrWithFiles[] | undefined;
}> = ({
  availableLabels,
  filter,
  filterSet,
  isOpen,
  isOpenSet,
  selectedLabel,
  selectedLabelSet,
  resultsList,
  prsWithSelectedFiles,
}) => (
  <div
    className={cns(
      styles.searchPopupContainer,
      isOpen && styles.popupContainer__hovered,
    )}
    data-testid="PrFilesSearchResultsPopup"
  >
    <Text as="h4" className={styles.title}>
      Conflicts Planer
    </Text>
    <ClosePopupButton onClick={() => isOpenSet(false)} />
    <LabelFilterBadges
      availableLabels={availableLabels}
      selectedLabel={selectedLabel}
      selectedLabelSet={selectedLabelSet}
    />
    <div className={cns(!!filter.size && styles.card)}>
      <SelectedFilesBadges filter={filter} filterSet={filterSet} />
      <PrsWithSelectedFilesList prsWithSelectedFiles={prsWithSelectedFiles} />
    </div>
    {selectedLabel && resultsList?.length === 0 ? (
      <Text className={styles.noMatchesHint}>
        No PRs match the current filters.
      </Text>
    ) : (
      <ResultsList resultsList={resultsList} filterSet={filterSet} />
    )}
  </div>
);

const LabelFilterBadges: React.FC<{
  availableLabels: PrLabel[];
  selectedLabel: string | undefined;
  selectedLabelSet: React.Dispatch<React.SetStateAction<string | undefined>>;
}> = ({ availableLabels, selectedLabel, selectedLabelSet }) =>
  availableLabels.length ? (
    <div className={styles.labelFilter} data-testid="LabelFilterBadges">
      <Text as="h5" className={styles.title}>
        Filter by Label
      </Text>
      <ul className={styles.labelBadgeList}>
        {availableLabels.map((label) => {
          const isSelected = selectedLabel === label.name;
          return (
            <li key={label.name}>
              <button
                type="button"
                aria-pressed={isSelected}
                className={cns(
                  styles.labelBadge,
                  isSelected && styles.labelBadge__selected,
                )}
                data-testid={`LabelFilterBadge-${label.name}`}
                style={{
                  backgroundColor: `#${label.color}`,
                  color: getLabelTextColor(label.color),
                }}
                onClick={() =>
                  selectedLabelSet(isSelected ? undefined : label.name)
                }
              >
                {label.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

function getLabelTextColor(color: string) {
  const normalizedColor = color.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalizedColor)) return "#ffffff";

  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 128 ? "#000000" : "#ffffff";
}

const ResultsList: React.FC<{
  resultsList: PrWithFiles[] | undefined;
  filterSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ resultsList, filterSet }) =>
  resultsList ? (
    <div className={styles.resultsList}>
      {resultsList.map(({ title, url, files }) => (
        <div key={title} className={styles.prFiles}>
          <PrTitleLink url={url} title={title} />
          <ul className={styles.list}>
            {files.map((file, index) => (
              <li
                key={index}
                onClick={() => {
                  filterSet((prev) => new Set(prev).add(file.filename));
                }}
                className={styles.filename}
              >
                {file.filename}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : null;

const SelectedFilesBadges: React.FC<{
  filter: Set<string>;
  filterSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ filter, filterSet }) =>
  filter.size ? (
    <>
      <Text as="h5" className={styles.title}>
        Selected Files
      </Text>
      <ul className={styles.badgeList}>
        {Array.from(filter).map((filename) => (
          <li
            key={filename}
            className={styles.badge}
            onClick={() => {
              filterSet((prev) => {
                const newSet = new Set(prev);
                newSet.delete(filename);
                return newSet;
              });
            }}
          >
            {filename}
          </li>
        ))}
      </ul>
    </>
  ) : null;

const PrTitleLink: React.FC<{ url: string; title: string }> = ({
  url,
  title,
}) => (
  <a href={url} target="_blank" rel="noreferrer">
    <Text as="h5">{title}</Text>
  </a>
);

const PrsWithSelectedFilesList: React.FC<{
  prsWithSelectedFiles: PrWithFiles[] | undefined;
}> = ({ prsWithSelectedFiles }) =>
  prsWithSelectedFiles && prsWithSelectedFiles.length > 0 ? (
    <>
      <Text as="h5" className={styles.title}>
        Prs With Selected Files
      </Text>
      {prsWithSelectedFiles.map(({ title, url }) => (
        <PrTitleLink key={url} url={url} title={title} />
      ))}
    </>
  ) : null;
