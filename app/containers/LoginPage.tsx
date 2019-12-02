import { Grid } from "@material-ui/core";
import Playlist from "../dataLayer/models/Playlist";
import Track from "../dataLayer/models/Track";
import axios from "axios";
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
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";

const Header = styled.div`
  font-size: 24px;
  padding-bottom: 8px;
`;

const LoginPage: React.FunctionComponent<any> = () => {
  const { t } = useTranslation();

  const UserStore = ({ user, playlists, trackCache }: RootStoreModel) => ({
    user,
    playlists,
    trackCache
  });

  const { user, playlists, trackCache } = useInject(UserStore);
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  useEffect(() => {
    document.addEventListener("keypress", _handleKeyPress);

    return function cleanup() {
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

  // TODO: this has to be in its own file or external function
  const getPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { data: playlistData } = await axios.get(
          "https://api.aye-player.de/playlists/v1",
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );

        for (const playlist of playlistData) {
          const pl = Playlist.create({
            id: playlist.Id,
            name: playlist.Name,
            tracks: []
          });
          if (playlist.tracks) {
            for (const track of playlist.tracks) {
              const tr = Track.create(track);
              if (!trackCache.getTrackById(track.id)) {
                trackCache.add(tr);
              }
              pl.addTrack(tr);
            }
          }

          playlists.add(pl);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const _handleOnClick = async (event?: React.MouseEvent) => {
    try {
      await user.authenticate(name, password);
      await getPlaylists();
      window.location.href = `${window.location.href.split("#/")[0]}#${
        routes.ACCOUNT
      }`;
    } catch (error) {
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
