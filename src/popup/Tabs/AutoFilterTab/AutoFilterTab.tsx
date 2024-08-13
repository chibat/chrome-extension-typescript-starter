import { FormikErrors } from "formik";
import React from "react";
import { Settings } from "../../../services";
import { FormField } from "../../FormField";

type Props = {
  errors: FormikErrors<Settings>;
};

export const AutoFilterTab = ({ errors }: Props) => {
  return (
    <>
      <FormField label="Filter" name="autoFilter.filter" />
      <FormField label="Repository" name="autoFilter.repo" />
    </>
  );
};
