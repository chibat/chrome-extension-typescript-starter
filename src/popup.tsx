import React from "react";
import { createRoot } from "react-dom/client";
import { Content } from "./popup/Content";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Content />
  </React.StrictMode>
);
