import { Route, Routes } from 'react-router';
import routes from './constants/routes.json';
import SearchPage from './containers/SearchPage';
import AccountPage from './containers/AccountPage';
import PlaylistPage from './containers/PlaylistPage';
import RegisterPage from './containers/RegisterPage';
import PasswordForgotPage from './containers/ForgotPasswordPage';
import ExtendedPlaylist from './components/ExtendedPlaylist/ExtendedPlaylist';
import AppSettingsPage from './containers/AppSettingsPage';
import LoginPage from './containers/LoginPage';
import AdminPage from './containers/AdminPage';

export default () => (
  <Routes>
    <Route path={routes.ACCOUNT} element={<AccountPage />} />
    <Route path={routes.PLAYLIST} element={<PlaylistPage />} />
    <Route path={routes.SEARCH} element={<SearchPage />} />
    <Route path={routes.REGISTER} element={<RegisterPage />} />
    <Route path={routes.FORGOTPASSWORD} element={<PasswordForgotPage />} />
    <Route path={routes.APPSETTINGS} element={<AppSettingsPage />} />
    <Route path={routes.ADMIN} element={<AdminPage />} />
    <Route path={routes.LOGIN} element={<LoginPage />} />
    <Route path="/playlist/:id" element={<ExtendedPlaylist />} />
  </Routes>
);
