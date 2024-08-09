import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Config, configSchema, getConfig } from "../services";
import styles from "./Content.module.scss";
import { FormField } from "./FormField";
import { Button } from "./Button";

type FormValues = Config;

const INITIAL_VALUES = {
  pat: "",
  org: "",
  repo: "",
  ghBaseUrl: "https://api.github.com",
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
              <FormField
                label="Personal Access Token"
                name="pat"
                error={errors.pat}
              />
              <FormField
                label="Organization"
                name="org"
                error={errors.org}
              />
              <FormField
                label="Repository"
                name="repo"
                error={errors.repo}
              />
              <FormField
                label="GitHub Base URL"
                name="ghBaseUrl"
                error={errors.ghBaseUrl}
              />
              <Button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Save"}
              </Button>
            </Form>
          )}
        </Formik>
        <article className={styles.label}>{result}</article>
      </div>
    </section>
  );
};
