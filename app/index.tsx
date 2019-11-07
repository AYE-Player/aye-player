import React, { Suspense } from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import Root from "./containers/Root";
import "./configs/i18next.config.client";
import "./app.global.css";
import { ipcRenderer } from "electron";
import i18n from "./configs/i18next.config.client";

ipcRenderer.on("language-changed", (event, message) => {
  if (!i18n.hasResourceBundle(message.language, message.namespace)) {
    i18n.addResourceBundle(
      message.language,
      message.namespace,
      message.resource
    );
  }

  i18n.changeLanguage(message.language);
});

render(
  <Suspense fallback={<div>Loading...</div>}>
    <AppContainer>
      <Root />
    </AppContainer>
  </Suspense>,
  document.getElementById("root")
);

if ((module as any).hot) {
  (module as any).hot.accept("./containers/Root", () => {
    // eslint-disable-next-line global-require
    const NextRoot = require("./containers/Root").default;
    render(
      <AppContainer>
        <NextRoot />
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
