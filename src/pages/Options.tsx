import { Box, PageLayout, Text } from "@primer/react";
import { Banner } from "@primer/react/drafts";
import { Form, Formik, FormikHelpers } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { TabNavigation, Subtitle } from "../components";
import { TABS, Tab } from "../constants";
import { Features, getSettings, INITIAL_VALUES } from "../services/getSettings";
import { Settings, persistSettings, settingsSchema } from "../services";
import { SubmitButton } from "./Button";
import { AiTab, GhInstancesTab, ImportExportTab, JiraTab } from "./Tabs";
import { FeatureTogglesTab } from "./Tabs/FeatureTogglesTab";
import styles from "./Options.module.scss";

export const Options = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Feature Toggles");
  const [features, setFeatures] = useState<Features>(INITIAL_VALUES.features);
  const [error, errorSet] = useState<string | undefined>();
  const [success, successSet] = useState<string | undefined>();
  const [initialValues, initialValuesSet] = useState<Settings>(INITIAL_VALUES);
  const [result, resultSet] = useState("");

  const loadSettings = useCallback(
    () =>
      getSettings({
        onSuccess: (settings) => {
          setFeatures(settings.features);
          initialValuesSet(settings);
        },
      }),
    [],
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = (key: keyof Features) => {
    const updatedFeatures = { ...features, [key]: !features[key] };
    setFeatures(updatedFeatures);
    initialValuesSet((prev) => ({ ...prev, features: updatedFeatures }));
    const useSync = updatedFeatures.persistToUserProfile;
    const storage = useSync ? chrome.storage.sync : chrome.storage.local;
    storage.set({ features: updatedFeatures }).catch((err) => {
      showError(
        err instanceof Error ? err.message : "Failed to save feature toggle",
      );
    });
    if (useSync) {
      chrome.storage.local
        .set({ features: updatedFeatures })
        .catch(() => undefined);
    }
  };

  const resetBanners = () => {
    errorSet(undefined);
    successSet(undefined);
  };

  const showError = (message?: string) => {
    resetBanners();
    errorSet(message);
  };

  const showSuccess = (message: string) => {
    resetBanners();
    successSet(message);
  };

  const handleSubmit = (
    values: Settings,
    { setSubmitting, resetForm }: FormikHelpers<Settings>,
  ) => {
    const merged = { ...values, features };
    persistSettings({
      values: merged,
      onSuccess: () => {
        resetForm({ values: merged });
        resultSet("Saved successfully");
        showSuccess("Settings saved successfully");
      },
      onError: () => {
        resultSet("Couldn't save");
        showError("Couldn't save settings");
      },
      onSettled: () => setSubmitting(false),
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Feature Toggles":
        return (
          <FeatureTogglesTab
            features={features}
            onToggle={handleToggle}
            onError={showError}
          />
        );
      case "Import/Export":
        return (
          <ImportExportTab
            onError={showError}
            onSuccess={showSuccess}
            onReset={resetBanners}
            onLoadSettings={loadSettings}
          />
        );
      case "GH Instances":
      case "Jira":
      case "AI":
        return (
          <Formik
            enableReinitialize
            validateOnMount
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={settingsSchema}
          >
            {({ isValid, dirty, isSubmitting, values }) => (
              <Form>
                {activeTab === "GH Instances" && (
                  <GhInstancesTab values={values} isValid={isValid} />
                )}
                {activeTab === "Jira" && (
                  <JiraTab
                    disabled={isSubmitting}
                    features={features}
                    onToggle={handleToggle}
                  />
                )}
                {activeTab === "AI" && (
                  <AiTab
                    disabled={isSubmitting}
                    features={features}
                    onToggle={handleToggle}
                  />
                )}
                <Box sx={{ marginTop: 4 }}>
                  <SubmitButton
                    isValid={isValid}
                    dirty={dirty}
                    isSubmitting={isSubmitting}
                    result={result}
                  />
                </Box>
              </Form>
            )}
          </Formik>
        );
    }
  };

  return (
    <Box
      className={styles.container}
      sx={{ backgroundColor: "canvas.default" }}
    >
      <PageLayout padding="none" containerWidth="full">
        <PageLayout.Content>
          <Box className={styles.content}>
            {error && <Banner variant="critical">{error}</Banner>}
            {success && <Banner variant="success">{success}</Banner>}

            <Box className={styles.header}>
              <img
                src="/icon128.png"
                alt="Git UI Booster Logo"
                className={styles.logo}
              />
              <Box>
                <Text as="h1" className={styles.title}>
                  Git UI Booster Options
                </Text>
                <Subtitle>
                  Making your Git workflow smoother than a freshly polished
                  commit 🚀
                </Subtitle>
              </Box>
            </Box>

            <TabNavigation
              tabs={TABS}
              activeTab={activeTab}
              onTabClick={setActiveTab}
            />

            {renderTabContent()}
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
};
