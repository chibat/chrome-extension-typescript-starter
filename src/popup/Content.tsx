import { Field, Form, Formik, FormikHelpers } from "formik";
import React, { useEffect, useRef, useState } from "react";

type FormValues = {
  pat: string;
  org: string;
  repo: string;
  ghBaseUrl: string;
  labelStyling: string;
};

const INITIAL_VALUES = {
  pat: "",
  org: "",
  repo: "",
  ghBaseUrl: "",
  labelStyling: "",
};

export const Content = () => {
  const [result, resultSet] = useState("");
  const [initialValues, initialValuesSet] =
    useState<FormValues>(INITIAL_VALUES);

  useEffect(() => {
    chrome.storage.local
      .get(["pat", "org", "repo", "ghBaseUrl", "labelStyling"])
      .then((entries) => {
        initialValuesSet({
          pat: entries?.pat ?? "",
          org: entries?.org ?? "",
          repo: entries?.repo ?? "",
          ghBaseUrl: entries?.ghBaseUrl ?? "",
          labelStyling: entries?.labelStyling ?? "",
        });
      })
      .catch(() => {
        resultSet("Couldn't load from chrome storage");
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
      style={{
        minWidth: "450px",
        minHeight: "560px",
        backgroundColor: "#fbf9f9",
      }}
    >
      <div>
        <h1>Settings</h1>
        <button type="button">Close</button>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
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
          <div>
            <label htmlFor="labelStyling">Label Styling</label>
            <Field id="labelStyling" name="labelStyling" disabled />
          </div>
          <button type="submit">Save</button>
        </Form>
      </Formik>
      <article>{result}</article>
    </div>
  );
};
