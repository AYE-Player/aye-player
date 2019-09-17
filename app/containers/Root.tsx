import * as React from "react";
import { Component } from "react";
import { Provider } from "mobx-react";
import { HashRouter } from "react-router-dom";
import Routes from "../Routes";

type Props = {
  store: any;
};

export default class Root extends Component<Props> {
  render() {
    const { store } = this.props;
    return (
      <Provider {...store}>
        <HashRouter>
          <Routes />
        </HashRouter>
      </Provider>
    );
  }
}
