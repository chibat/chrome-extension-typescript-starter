import React from "react";
import { createRoot } from "react-dom/client";
import { Content } from "./popup/Content";
import "./styles.scss";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Content />
  </React.StrictMode>
);
