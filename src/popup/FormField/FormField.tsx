import { Field } from "formik";
import React from "react";
import styles from "./FormField.module.scss";

type Props = {
  label: string;
  name: string;
  error?: string;
};

export const FormField: React.FC<Props> = ({ label, name, error }) => {
  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
      <Field className={styles.field} id={name} name={name} type="text" />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};
