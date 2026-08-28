import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportButton } from "../ExportButton";
import * as getSettingsModule from "../../../services/getSettings";
import { Settings } from "../../../services";

jest.mock("../../../services/getSettings");

describe("ExportButton", () => {
  const mockSettings: Settings = {
    instances: [
      {
        pat: "ghp_test1234567890123456789012345678",
        org: "test-org",
        repo: "test-repo",
        ghBaseUrl: "https://api.github.com",
        randomReviewers: "user1,user2",
      },
    ],
    features: {
      baseBranchLabels: true,
      changedFiles: true,
      totalLinesPrs: true,
      totalLinesPr: true,
      reOrderPrs: false,
      addUpdateBranchButton: false,
      aiCodeSummary: false,
      aiSummary: false,
      autoFilter: false,
      prTitleFromJira: false,
      descriptionTemplate: false,
      randomReviewer: false,
      persistToUserProfile: false,
    },
    fileBlacklist: "package-lock.json",
  };

  let mockWritable: {
    write: jest.Mock;
    close: jest.Mock;
  };

  let mockHandle: {
    createWritable: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockWritable = {
      write: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockHandle = {
      createWritable: jest.fn().mockResolvedValue(mockWritable),
    };
  });

  test("renders export button with correct text and icon", () => {
    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    expect(button).toBeInTheDocument();
  });

  test("calls onClick callback when clicked", async () => {
    const onClickMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    // Mock File System Access API
    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton onClick={onClickMock} />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  test("fetches settings when export button is clicked", async () => {
    const getSettingsSpy = jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    // Mock File System Access API
    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(getSettingsSpy).toHaveBeenCalledTimes(1);
    });
  });

  test("uses File System Access API to save settings when available", async () => {
    const showSaveFilePickerMock = jest.fn().mockResolvedValue(mockHandle);

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: showSaveFilePickerMock,
      writable: true,
      configurable: true,
    });

    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(showSaveFilePickerMock).toHaveBeenCalledWith({
        suggestedName: "git-ui-booster-settings.json",
        types: [
          {
            description: "JSON file",
            accept: { "application/json": [".json"] },
          },
        ],
      });
    });
  });

  test("writes settings as JSON to file", async () => {
    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockHandle.createWritable).toHaveBeenCalled();
    });

    expect(mockWritable.write).toHaveBeenCalledWith(
      JSON.stringify(mockSettings, null, 2),
    );
    expect(mockWritable.close).toHaveBeenCalled();
  });

  test("calls onSuccess callback after successful export", async () => {
    const onSuccessMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton onSuccess={onSuccessMock} />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });

  test("calls onError when file picker is cancelled", async () => {
    const onErrorMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    // Mock user cancelling the file picker
    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockRejectedValue(new Error("User cancelled")),
      writable: true,
      configurable: true,
    });

    render(<ExportButton onError={onErrorMock} />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith("Saving cancelled or failed.");
    });
  });

  test("calls onError when writing to file fails", async () => {
    const onErrorMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    // Mock write failure
    const failingWritable = {
      write: jest.fn().mockRejectedValue(new Error("Write failed")),
      close: jest.fn(),
    };

    const failingHandle = {
      createWritable: jest.fn().mockResolvedValue(failingWritable),
    };

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(failingHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton onError={onErrorMock} />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith("Saving cancelled or failed.");
    });
  });

  test("calls onError when File System Access API is not available", async () => {
    const onErrorMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    // Remove File System Access API
    Object.defineProperty(window, "showSaveFilePicker", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ExportButton onError={onErrorMock} />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith(
        "File System Access API is not supported.",
      );
    });
  });

  test("calls onError when getSettings fails", async () => {
    const onErrorMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onError }) => {
        void onError?.();
      });

    render(<ExportButton onError={onErrorMock} />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith(
        "Could not load settings for download.",
      );
    });
  });

  test("does not call onSuccess when not provided", async () => {
    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    // Should not throw
    await waitFor(() => {
      expect(mockWritable.close).toHaveBeenCalled();
    });
  });

  test("does not call onError when not provided and operation fails", async () => {
    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockRejectedValue(new Error("Cancelled")),
      writable: true,
      configurable: true,
    });

    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    // Should not throw
    await waitFor(() => {
      expect(getSettingsModule.getSettings).toHaveBeenCalled();
    });
  });

  test("renders Button component with correct variant", () => {
    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    expect(button).toBeInTheDocument();
  });

  test("handles all callbacks being provided simultaneously", async () => {
    const onSuccessMock = jest.fn();
    const onErrorMock = jest.fn();
    const onClickMock = jest.fn();

    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(
      <ExportButton
        onSuccess={onSuccessMock}
        onError={onErrorMock}
        onClick={onClickMock}
      />,
    );

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onClickMock).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).not.toHaveBeenCalled();
    });
  });

  test("formats JSON with 2-space indentation", async () => {
    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(mockSettings);
      });

    Object.defineProperty(window, "showSaveFilePicker", {
      value: jest.fn().mockResolvedValue(mockHandle),
      writable: true,
      configurable: true,
    });

    render(<ExportButton />);

    const button = screen.getByRole("button", { name: /export settings/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWritable.write).toHaveBeenCalledWith(
        expect.stringContaining("  "), // Check for 2-space indentation
      );
    });

    const writtenContent = mockWritable.write.mock.calls[0][0];
    expect(writtenContent).toBe(JSON.stringify(mockSettings, null, 2));
  });
});
