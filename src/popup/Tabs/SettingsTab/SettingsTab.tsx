import React from "react";
import { FormField } from "../../FormField";
import { Settings } from "../../../services";
import { FormikErrors } from "formik";

type Props = {
  errors: FormikErrors<Settings>;
};

export const SettingsTab = ({ errors }: Props) => {
  return (
    <>
      <FormField label="Personal Access Token" name="pat" error={errors.pat} />
      <FormField label="Organization" name="org" error={errors.org} />
      <FormField label="Repository" name="repo" error={errors.repo} />
      <FormField
        label="GitHub Base URL"
        name="ghBaseUrl"
        error={errors.ghBaseUrl}
      />
    </>
  );
};
