import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Config, configSchema, getConfig } from "../services";
import styles from "./Content.module.scss";

type FormValues = Config;

const INITIAL_VALUES = {
  pat: "",
  org: "",
  repo: "",
  ghBaseUrl: "",
};

export const Content = () => {
  const [result, resultSet] = useState("");
  const [initialValues, initialValuesSet] =
    useState<FormValues>(INITIAL_VALUES);

  useEffect(() => {
    getConfig({
      onSuccess: initialValuesSet,
      onError: () => resultSet("Couldn't load from chrome storage"),
    });
  }, []);

  const handleSubmit = (values: FormValues) => {
    const promises = Object.entries(values).map(([key, value]) => {
      return chrome.storage.local.set({
        [key]: value,
      });
    });
    Promise.all(promises)
      .then(() => resultSet("Saved successfully"))
      .catch(() => resultSet("Couldn't save"));
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>GitHub UI Booster - Settings</h1>
        </div>
        <div className={styles.divider} />
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={configSchema}
        >
          {({ errors, isValid, dirty, isSubmitting }) => (
            <Form className={styles.form}>
              <div className={styles.fieldWrapper}>
                <label className={styles.label} htmlFor="pat">Personal Access Token</label>
                <Field className={styles.field} id="pat" name="pat" type="text" required />
              </div>
              <div className={styles.fieldWrapper}>
                <label className={styles.label} htmlFor="org">Organization</label>
                <Field className={styles.field} id="org" name="org" type="text" required />
              </div>
              <div className={styles.fieldWrapper}>
                <label className={styles.label} htmlFor="repo">Repository</label>
                <Field className={styles.field} id="repo" name="repo" type="text" required />
              </div>
              <div className={styles.fieldWrapper}>
                <label className={styles.label} htmlFor="ghBaseUrl">GitHub Base URL</label>
                <Field className={styles.field} id="ghBaseUrl" name="ghBaseUrl" type="text" required />
              </div>
              <button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
                className={styles.button}
              >
                {isSubmitting ? "Submitting..." : "Save"}
              </button>
              <div className={styles.label}>{JSON.stringify(errors)}</div>
            </Form>
          )}
        </Formik>
        <article className={styles.label}>{result}</article>
      </div>
    </section>
  );
};
