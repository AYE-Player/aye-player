import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { remote } from "electron";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { version } from "../../package.json";
import CustomDropDown from "../components/Customs/CustomDropDown";
import CustomListDialog from "../components/Customs/CustomListDialog";
import CustomSwitch from "../components/Customs/CustomSwitch";
import SnackMessage from "../components/Customs/SnackMessage";
import Divider from "../components/Divider";
import Track from "../dataLayer/models/Track";
import RootStore from "../dataLayer/stores/RootStore";
import { getSpotifyAccessToken, getSpotifyPlaylists } from "../helpers";
import spotifyToLocalTracks from "../helpers/spotify/spotifyToLocalTracks";
import useInject from "../hooks/useInject";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";
const SpotifyLogo = require("../images/Spotify_Logo_CMYK_Green.png");

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div``;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
  padding: 40px;
`;

const InfoText = styled.div`
  position: absolute;
  bottom: 56px;
  right: 8px;
  font-size: 14px;
`;

const AccountPage: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const store = ({ app, user, playlists, trackCache }: RootStore) => ({
    app,
    user,
    playlists,
    trackCache,
  });

  const { app, user, playlists, trackCache } = useInject(store);

  const [spotifyListnames, setSpotifyListNames] = React.useState<any[]>([]);
  const [spotifyLists, setSpotifyLists] = React.useState<any>();
  const [open, setOpen] = React.useState(false);

  const _switchRPCStatus = () => {
    app.toggleRPC();
  };

  const _switchMinToTray = () => {
    app.toggleMinimizeToTray();
  };

  const _activateDevMode = () => {
    app.toggleDevMode();
    remote.getCurrentWindow().reload();
  };

  const [language, setLanguage] = React.useState(app.language);

  const _handleChange = async (event: React.ChangeEvent<{ value: string }>) => {
    setLanguage(event.target.value);
    app.setLanguage(event.target.value);
  };

  const _switchAutoRadio = () => {
    app.toggleAutoRadio();
  };

  const _switchShowNotifications = () => {
    app.toggleShowNotifications();
  };

  const _createSpotifyAuth = async () => {
    const token = await getSpotifyAccessToken();
    localStorage.setItem("spotify_token", token);
    const importedPlaylists = (await getSpotifyPlaylists(token)) as any[];

    const playlistNames = importedPlaylists.map((playlist: any) => {
      return { id: playlist.id, name: playlist.name };
    });
    console.log("playlist names", playlistNames);

    setSpotifyListNames(playlistNames);
    setSpotifyLists(importedPlaylists);
    setOpen(true);
  };

  const _handleClose = () => {
    setOpen(false);
  };

  //FIXME: Fix creation of playlist, sometimes (or always?) only half the songs are added
  const _handleListSelected = async (id: string) => {
    try {
      const list = spotifyLists.find((playlist: any) => playlist.id === id);
      const tracks = await spotifyToLocalTracks(list);

      const pl = await playlists.createList(list.name);

      for (const track of tracks) {
        const mobxTrack = new Track({
          id: track.id,
          duration: track.duration,
          title: track.title,
        });

        if (!trackCache.getTrackById(mobxTrack.id)) {
          trackCache.add(mobxTrack);
        }

        await pl.addTrack(mobxTrack);
      }
    } catch (error) {
      AyeLogger.player(
        `Error creating playlist ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t("Playlist.couldNotCreate")}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  return (
    <ClickAwayListener onClickAway={_handleClose} disableReactTree>
      <Container>
        <Header>{t("AppSettingsPage.header")}</Header>
        <SettingsContainer>
          <CustomSwitch
            label={t("AppSettingsPage.discord")}
            onChange={_switchRPCStatus}
            checked={app.rpcEnabled}
          />
          <Divider size={2} />
          <CustomSwitch
            label={t("AppSettingsPage.tray")}
            onChange={_switchMinToTray}
            checked={app.minimizeToTray}
          />
          <Divider size={2} />
          <CustomSwitch
            label={t("AppSettingsPage.autoRadio")}
            onChange={_switchAutoRadio}
            checked={app.autoRadio}
          />
          <Divider size={2} />
          <CustomSwitch
            label={t("AppSettingsPage.showNotifications")}
            onChange={_switchShowNotifications}
            checked={app.showNotifications}
          />
          <CustomDropDown
            name={t("AppSettingsPage.language")}
            id="language-select"
            options={[
              { value: "en", text: "English" },
              { value: "de", text: "Deutsch" },
            ]}
            selected={language}
            setSelected={setLanguage}
            handleChange={_handleChange}
          />
          <Divider size={2} />
          Connect to:
          <Divider size={2} />
          <img
            src={SpotifyLogo}
            width={150}
            style={{ cursor: "pointer" }}
            onClick={() => _createSpotifyAuth()}
          />
          {user.roles.find((role: string) => role === "admin") && (
            <>
              <Divider size={2} />
              <CustomSwitch
                label={t("AppSettingsPage.devMode")}
                onChange={_activateDevMode}
                checked={app.devMode}
              />
            </>
          )}
        </SettingsContainer>
        <InfoText>v{version}</InfoText>
        <CustomListDialog
          dialogTitle={t("Spotify.importPlaylist")}
          open={open}
          onSelect={_handleListSelected}
          handleClose={_handleClose}
          options={spotifyListnames.map(({ name, id }) => {
            return {
              name,
              id,
            };
          })}
        />
      </Container>
    </ClickAwayListener>
  );
};

export default observer(AccountPage);
