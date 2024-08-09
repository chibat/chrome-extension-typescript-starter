import { InferType, object, string } from 'yup';

export const settingsSchema = object({
  pat: string().required().matches(/^ghp_/, 'Should start with ghp_').min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
});

export type Settings = InferType<typeof settingsSchema>;
export type SettingName = keyof Settings;

export const INITIAL_VALUES = {
  pat: '',
  org: '',
  repo: '',
  ghBaseUrl: 'https://api.github.com',
};

type Params = {
  onSuccess: (settings: Settings) => void;
  onError: () => void;
};

export function getSettings({ onSuccess, onError }: Params) {
  chrome.storage.local
    .get(Object.keys(settingsSchema.fields))
    .then((entries) => {
      if (Object.keys(entries).length === 0) {
        onSuccess(INITIAL_VALUES);
      } else {
        settingsSchema
          .validate(entries)
          .then((settings) => onSuccess(settings))
          .catch(() => onError());
      }
    });
}
