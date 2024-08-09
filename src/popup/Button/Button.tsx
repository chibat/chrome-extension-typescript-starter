import React from "react";
import styles from "./Button.module.scss";

type Props = {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  children?: React.ReactNode;
  result?: string;
};

export const Button: React.FC<Props> = ({
  children,
  disabled,
  type,
  result,
}) => {
  return (
    <>
      <button type={type} disabled={disabled} className={styles.button}>
        {children}
      </button>
      {result && <p className={styles.result}>{result}</p>}
    </>
  );
};
