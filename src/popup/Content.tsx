import React, { useEffect, useState } from "react";
import styles from "./Content.module.scss";
import { SettingsTab } from "./Tabs";
import { Tab, TabNavigation } from "../components";
import { AutoFilterTab } from "./Tabs/AutoFilterTab";
import { Form, Formik, FormikErrors, FormikHelpers } from "formik";
import {
  INITIAL_VALUES,
  Settings,
  getSettings,
  settingsSchema,
} from "../services";
import { Button } from "./Button";

const tabs: Array<Tab> = ["Auto filter", "Settings"];
type FormValues = Settings;

export const Content = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Auto filter");
  const [result, resultSet] = useState("");
  const [initialValues, initialValuesSet] =
    useState<FormValues>(INITIAL_VALUES);

  useEffect(() => {
    getSettings({
      onSuccess: initialValuesSet,
      onError: () => resultSet("Couldn't load from chrome storage"),
    });
  }, []);

  const handleSubmit = (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    const promises = Object.entries(values).map(([key, value]) => {
      return chrome.storage.local.set({
        [key]: value,
      });
    });
    Promise.all(promises)
      .then(() => {
        // reset form-state, e.g. isDirty
        resetForm({ values });
        resultSet("Saved successfully");
      })
      .catch(() => resultSet("Couldn't save"))
      .finally(() => setSubmitting(false));
  };

  const mapTabToComponent = (tab: Tab, errors: FormikErrors<FormValues>) => {
    switch (tab) {
      case "Auto filter":
        return <AutoFilterTab errors={errors} />;
      case "Settings":
        return <SettingsTab errors={errors} />;
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>GitHub UI Booster - Settings</h1>
        </div>
        <div className={styles.divider} />
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleSubmit}
          //validationSchema={settingsSchema}
        >
          {({ errors, isValid, dirty, isSubmitting }) => {
            return (
              <Form className={styles.form}>
                {mapTabToComponent(activeTab, errors)}
                <Button
                  type="submit"
                  disabled={!isValid || !dirty || isSubmitting}
                  result={isSubmitting ? undefined : result}
                >
                  {isSubmitting ? "Submitting..." : "Save"}
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </section>
  );
};
