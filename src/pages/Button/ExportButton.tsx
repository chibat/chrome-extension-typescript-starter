import { DownloadIcon } from "@primer/octicons-react";
import React from "react";
import { Button } from "./Button";
import { getSettings } from "../../services/getSettings";

type Props = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClick?: () => void;
};
export const ExportButton: React.FC<Props> = ({
  onError,
  onSuccess,
  onClick,
}) => {
  const handleDownloadSettings = () => {
    onClick?.();
    getSettings({
      onSuccess: async (settings) => {
        const json = JSON.stringify(settings, null, 2);
        // Use File System Access API if available
        if ("showSaveFilePicker" in window && window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: "git-ui-booster-settings.json",
              types: [
                {
                  description: "JSON file",
                  accept: { "application/json": [".json"] },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            onSuccess?.();
          } catch {
            onError?.("Saving cancelled or failed.");
          }
        } else {
          onError?.("File System Access API is not supported.");
        }
      },
      onError: () => onError?.("Could not load settings for download."),
    });
  };

  return (
    <Button
      onClick={handleDownloadSettings}
      variant="default"
      icon={DownloadIcon}
    >
      Export Settings
    </Button>
  );
};

// Type definitions for File System Access API to make TypeScript happy
declare global {
  interface Window {
    showSaveFilePicker?: (
      options?: SaveFilePickerOptions,
    ) => Promise<FileSystemFileHandle>;
  }

  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
    excludeAcceptAllOption?: boolean;
  }

  interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
  }
}
