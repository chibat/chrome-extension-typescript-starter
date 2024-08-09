import { InferType, object, string } from "yup";

export const configSchema = object({
  pat: string().required().matches(/^ghp_/, "Should start with ghp_").min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
});

export type Config = InferType<typeof configSchema>;

type Params = {
  onSuccess: (config: Config) => void;
  onError: () => void;
};

export function getConfig({ onSuccess, onError }: Params) {
  chrome.storage.local
    .get(["pat", "org", "repo", "ghBaseUrl", "labelStyling"])
    .then((entries) =>
      configSchema
        .validate(entries)
        .then((config) => onSuccess(config))
        .catch(() => onError)
    );
}
