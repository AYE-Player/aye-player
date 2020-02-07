import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomDropDown from "../components/Customs/CustomDropDown";
import CustomSwitch from "../components/Customs/CustomSwitch";
import Divider from "../components/Divider";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { remote } from "electron";
import { version } from "../../package.json";
import { getSpotifyAccessToken, getSpotifyPlaylists } from "../helpers";
import Track from "../dataLayer/models/Track";
import spotifyToLocalTracks from "../helpers/spotify/spotifyToLocalTracks";
import CustomListDialog from "../components/Customs/CustomListDialog";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
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
  const store = ({ app, user, playlists, trackCache }: RootStore) => ({
    app,
    user,
    playlists,
    trackCache
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

  const { t } = useTranslation();

  const _handleChange = async (event: React.ChangeEvent<{ value: string }>) => {
    setLanguage(event.target.value);
    app.setLanguage(event.target.value);
  };

  const _switchAutoRadio = () => {
    app.toggleAutoRadio();
  };

  const _createSpotifyAuth = async () => {
    const token = await getSpotifyAccessToken();
    localStorage.setItem("spotify_token", token);
    const importedPlaylists = (await getSpotifyPlaylists(token)) as any[];

    const playlistNames = importedPlaylists.map(
      (playlist: any) => {
        return { id: playlist.id, name: playlist.name };
      }
    );
    console.log("playlist names", playlistNames);

    setSpotifyListNames(playlistNames);
    setSpotifyLists(importedPlaylists);
    setOpen(true);
  };

  const _handleClose = () => {
    setOpen(false);
  };

  const _handleListSelected = async (id: string) => {
    const list = spotifyLists.find((playlist: any) => playlist.id === id);
    const tracks = await spotifyToLocalTracks(list);

    const pl = await playlists.createList(list.name);

    for (const track of tracks) {
      const mobxTrack = new Track({
        id: track.id,
        duration: track.duration,
        title: track.title
      });

      trackCache.add(mobxTrack);

      await pl.addTrack(mobxTrack);
    }
  };

  return (
    <ClickAwayListener onClickAway={_handleClose}>
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
          <CustomDropDown
            name={t("AppSettingsPage.language")}
            id="language-select"
            options={[
              { value: "en", text: "English" },
              { value: "de", text: "Deutsch" }
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
              id
            };
          })}
        />
      </Container>
    </ClickAwayListener>
  );
};

export default observer(AccountPage);
