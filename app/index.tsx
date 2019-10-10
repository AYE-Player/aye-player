import * as React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import Root from "./containers/Root";
import store from "./store";
import "./app.global.css";

render(
  <AppContainer>
    <Root store={store} />
  </AppContainer>,
  document.getElementById("root")
);

if ((module as any).hot) {
  (module as any).hot.accept("./containers/Root", () => {
    // eslint-disable-next-line global-require
    const NextRoot = require("./containers/Root").default;
    render(
      <AppContainer>
        <NextRoot store={store} />
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
