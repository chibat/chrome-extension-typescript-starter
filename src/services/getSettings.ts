import { InferType, object, string } from 'yup';

export const settingsSchema = object({
  pat: string().required().matches(/^ghp_/, 'Should start with ghp_').min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
});

export type Settings = InferType<typeof settingsSchema>;

type Params = {
  onSuccess: (settings: Settings) => void;
  onError: () => void;
};

export function getSettings({ onSuccess, onError }: Params) {
  chrome.storage.local
    .get(['pat', 'org', 'repo', 'ghBaseUrl', 'labelStyling'])
    .then((entries) =>
      settingsSchema
        .validate(entries)
        .then((settings) => onSuccess(settings))
        .catch(() => onError)
    );
}
