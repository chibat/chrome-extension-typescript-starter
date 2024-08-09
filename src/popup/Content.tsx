import { Form, Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';
import { Settings, getSettings, settingsSchema } from '../services';
import { Button } from './Button';
import styles from './Content.module.scss';
import { FormField } from './FormField';

type FormValues = Settings;

const INITIAL_VALUES = {
  pat: '',
  org: '',
  repo: '',
  ghBaseUrl: 'https://api.github.com',
};

export const Content = () => {
  const [result, resultSet] = useState('');
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
        resultSet('Saved successfully');
      })
      .catch(() => resultSet("Couldn't save"))
      .finally(() => setSubmitting(false));
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
          validationSchema={settingsSchema}
        >
          {({ errors, isValid, dirty, isSubmitting }) => (
            <Form className={styles.form}>
              <FormField
                label='Personal Access Token'
                name='pat'
                error={errors.pat}
              />
              <FormField label='Organization' name='org' error={errors.org} />
              <FormField label='Repository' name='repo' error={errors.repo} />
              <FormField
                label='GitHub Base URL'
                name='ghBaseUrl'
                error={errors.ghBaseUrl}
              />
              <Button
                type='submit'
                disabled={!isValid || !dirty || isSubmitting}
                result={isSubmitting ? undefined : result}
              >
                {isSubmitting ? 'Submitting...' : 'Save'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
};
