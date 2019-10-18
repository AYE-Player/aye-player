import React from "react";
import { Switch, Route } from "react-router";
import routes from "./constants/routes.json";
import App from "./containers/App";
import SearchPage from "./containers/SearchPage";
import AccountPage from "./containers/AccountPage";
import PlaylistPage from "./containers/PlaylistPage";
import LoginPage from "./containers/LoginPage";

export default () => (
  <App>
    <Switch>
      <Route exact path={routes.ACCOUNT} component={AccountPage} />
      <Route exact path={routes.PLAYLIST} component={PlaylistPage} />
      <Route exact path={routes.LOGIN} component={LoginPage} />
      <Route exact path={routes.SEARCH} component={SearchPage} />
    </Switch>
  </App>
);
