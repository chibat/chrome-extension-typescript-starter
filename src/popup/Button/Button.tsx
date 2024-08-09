import React from "react";
import styles from "./Button.module.scss";

type Props = {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  children?: React.ReactNode;
};

export const Button: React.FC<Props> = ({ children, disabled, type }) => {
  return (
    <button type={type} disabled={disabled} className={styles.button}>
      {children}
    </button>
  );
};
