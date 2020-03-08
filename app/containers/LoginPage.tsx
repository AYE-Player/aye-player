import { Grid } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton";
import CustomTextField from "../components/Customs/CustomTextField";
import SnackMessage from "../components/Customs/SnackMessage";
import Divider from "../components/Divider";
import SmallLink from "../components/Link/SmallLink";
import routes from "../constants/routes.json";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import ApiClient from "../dataLayer/api/ApiClient";
import Playlist from "../dataLayer/models/Playlist";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const LoginPage: React.FunctionComponent = () => {
  const { t } = useTranslation();

  const Store = ({ user, playlists }: RootStore) => ({
    user,
    playlists
  });

  const { user, playlists } = useInject(Store);
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  useEffect(() => {
    document.addEventListener("keypress", _handleKeyPress);

    return () => {
      document.removeEventListener("keypress", _handleKeyPress);
    };
  });

  const _handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const _handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const getPlaylists = async () => {
    const data = await ApiClient.getPlaylists();

    for (const playlist of data) {
      const pl = new Playlist({
        id: playlist.Id,
        name: playlist.Name,
        duration: playlist.Duration,
        trackCount: playlist.SongsCount,
        isReadonly: playlist.IsReadonly,
        tracks: []
      });

      playlists.add(pl);
    }
  };

  const _handleOnClick = async (event?: React.MouseEvent) => {
    try {
      await user.authenticate(name, password);
      await getPlaylists();
      window.location.href = `${window.location.href.split("#/")[0]}#${
        routes.SEARCH
      }`;
    } catch (error) {
      AyeLogger.player(
        `Error on login ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        )
      });
    }
  };

  const _handleKeyPress = async (event: any) => {
    if (event.key === "Enter" && name && password) {
      _handleOnClick();
    }
  };

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ height: "100%" }}
    >
      <Header>{t("LoginPage.header")}</Header>
      <Divider size={2} />
      <CustomTextField
        autoFocus
        label={t("LoginPage.username")}
        id="username"
        onChange={_handleNameChange}
        key="username"
        type="text"
      />
      <Divider size={2} />
      <CustomTextField
        label={t("LoginPage.password")}
        id="password"
        onChange={_handlePasswordChange}
        key="password"
        type="password"
      />
      <Divider size={3} />
      <CustomButton
        onClick={_handleOnClick}
        name={t("LoginPage.loginButton")}
      />
      <Divider size={3} />
      <SmallLink name={t("LoginPage.registerLink")} to={routes.REGISTER} />
      <Divider />
      <SmallLink
        name={t("LoginPage.forgotPasswordLink")}
        to={routes.FORGOTPASSWORD}
      />
    </Grid>
  );
};

export default LoginPage;
