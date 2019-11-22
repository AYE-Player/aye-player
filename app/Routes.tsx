import React from "react";
import { Switch, Route } from "react-router";
import routes from "./constants/routes.json";
import SearchPage from "./containers/SearchPage";
import AccountPage from "./containers/AccountPage";
import PlaylistPage from "./containers/PlaylistPage";
import RegisterPage from "./containers/RegisterPage";
import PasswordForgotPage from "./containers/ForgotPasswordPage";
import ExtendedPlaylist from "./components/ExtendedPlaylist/ExtendedPlaylist";
import AppSettingsPage from "./containers/AppSettingsPage";
import LoginPage from "./containers/LoginPage";

export default () => (
    <Switch>
      <Route exact path={routes.ACCOUNT} component={AccountPage} />
      <Route exact path={routes.PLAYLIST} component={PlaylistPage} />
      <Route exact path={routes.SEARCH} component={SearchPage} />
      <Route exact path={routes.REGISTER} component={RegisterPage} />
      <Route exact path={routes.FORGOTPASSWORD} component={PasswordForgotPage} />
      <Route exact path={routes.APPSETTINGS} component={AppSettingsPage} />
      <Route exact path={routes.LOGIN} component={LoginPage} />
      <Route path="/playlist/:id" component={ExtendedPlaylist} />
    </Switch>
);
