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
    <div
      className={styles.container}
    >
      <div>
        <h1>Settings</h1>
        <button type="button">Close</button>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={configSchema}
      >
        {({ errors, isValid, dirty, isSubmitting }) => (
          <Form>
            <div>
              <label htmlFor="pat">Personal Access Token</label>
              <Field id="pat" name="pat" type="text" required />
            </div>
            <div>
              <label htmlFor="org">Organization</label>
              <Field id="org" name="org" type="text" required />
            </div>
            <div>
              <label htmlFor="repo">Repository</label>
              <Field id="repo" name="repo" type="text" required />
            </div>
            <div>
              <label htmlFor="ghBaseUrl">GitHub Base URL</label>
              <Field id="ghBaseUrl" name="ghBaseUrl" type="text" required />
            </div>
            <button type="submit" disabled={!isValid || !dirty || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Save"}
            </button>
            <div>{JSON.stringify(errors)}</div>
          </Form>
        )}
      </Formik>
      <article>{result}</article>
    </div>
  );
};
