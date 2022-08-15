/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ISpotifyPlaylist } from 'types/response';
import CustomButton from 'renderer/components/Customs/CustomButton';
import { Channel } from '../../types/enums';
import CustomDropDown from '../components/Customs/CustomDropDown';
import CustomListDialog from '../components/Customs/CustomListDialog';
import CustomSwitch from '../components/Customs/CustomSwitch';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import Track from '../dataLayer/models/Track';
import { getSpotifyPlaylists } from '../../helpers';
import spotifyPlaylistToLocalTracks from '../../helpers/spotify/spotifyPlaylistToLocalTracks';
import ListenMoeLoginDialog from '../components/ListenMoeLoginDialog';
import ListenMoeApiClient from '../dataLayer/api/ListenMoeApiClient';
import { useStore } from '../components/StoreProvider';

const SpotifyLogo = require('../../images/Spotify_Logo_CMYK_Green.png');
const ListenMoeLogo = require('../../images/listenmoe.svg');

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div``;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-items: center;
  padding: 40px;
  gap: 64px;
`;

const InfoText = styled.div`
  font-size: 12px;
`;

const SettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountPage: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { app, user, playlists, trackCache, player } = useStore();

  const [spotifyListnames, setSpotifyListNames] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [spotifyLists, setSpotifyLists] = React.useState<ISpotifyPlaylist[]>(
    []
  );
  const [spotifyPlaylistsOpen, setSpotifyPlaylistsOpen] = React.useState(false);

  const [listenMoeOpen, setListenMoeOpen] = React.useState(false);
  const [listenMoeUsername, setListenMoeUsername] = React.useState('');
  const [listenMoePassword, setListenMoePassword] = React.useState('');

  window.electron.ipcRenderer.on(
    Channel.GOT_SPOTIFY_TOKEN,
    async (token: string) => {
      localStorage.setItem('spotifytoken', token);
      const importedPlaylists = await getSpotifyPlaylists(token);

      const playlistNames = importedPlaylists.map((playlist) => {
        return { id: playlist.id, name: playlist.name };
      });

      setSpotifyListNames(playlistNames);
      setSpotifyLists(importedPlaylists);
      setSpotifyPlaylistsOpen(true);
    }
  );

  const switchRPCStatus = () => {
    app.toggleRPC();
  };

  const switchMinToTray = () => {
    app.toggleMinimizeToTray();
  };

  const activateDevMode = () => {
    app.toggleDevMode();
    window.electron.ipcRenderer.sendMessage(Channel.RELOAD_MAIN_WINDOW);
  };

  const [language, setLanguage] = React.useState(app.language);

  const handleChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    setLanguage(event.target.value as string);
    app.setLanguage(event.target.value as string);
  };

  const switchAutoRadio = () => {
    app.toggleAutoRadio();
  };

  const switchShowNotifications = () => {
    app.toggleShowNotifications();
  };

  const createSpotifyAuth = async () => {
    window.electron.ipcRenderer.sendMessage(Channel.OPEN_SPOTIFY_LOGIN_WINDOW);
  };

  const handleClose = () => {
    setSpotifyPlaylistsOpen(false);
  };

  // FIXME: Fix creation of playlist, sometimes (or always?) only half the songs are added
  // also it seems, that the endpoints have been further restricted and throw a 429 real quick
  const handleListSelected = async (id: string) => {
    try {
      const list = spotifyLists.find((playlist) => playlist.id === id);

      if (!list) return;

      const tracks = await spotifyPlaylistToLocalTracks(list);

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

        // eslint-disable-next-line no-await-in-loop
        await pl.addTrack(mobxTrack);
      }
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error creating playlist ${JSON.stringify(error, null, 2)}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('Playlist.couldNotCreate')}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const handleLoginClick = async () => {
    try {
      const token = await ListenMoeApiClient.login(
        listenMoeUsername,
        listenMoePassword
      );

      localStorage.setItem('listenMoetoken', token);
      app.setListenMoeLogin(true);

      setListenMoeUsername('');
      setListenMoePassword('');
      setListenMoeOpen(false);
    } catch (error) {
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('AppSettingsPage.ListenMoeLoginError')}`}
          />
        ),
      });
    }
  };

  const handleCancelClick = () => {
    setListenMoeUsername('');
    setListenMoePassword('');
    setListenMoeOpen(false);
  };

  const deselectTrack = () => {
    player.setCurrentTrack();
  };

  const deselectPlaylist = () => {
    player.setCurrentPlaylist();
  };

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container>
        <Header>{t('AppSettingsPage.header')}</Header>
        <SettingsContainer>
          <SettingsColumn>
            <CustomSwitch
              label={t('AppSettingsPage.discord')}
              onChange={switchRPCStatus}
              checked={app.rpcEnabled}
            />
            <Divider size={2} />
            <CustomSwitch
              label={t('AppSettingsPage.tray')}
              onChange={switchMinToTray}
              checked={app.minimizeToTray}
            />
            <Divider size={2} />
            <CustomSwitch
              label={t('AppSettingsPage.autoRadio')}
              onChange={switchAutoRadio}
              checked={app.autoRadio}
            />
            <Divider size={2} />
            <CustomSwitch
              label={t('AppSettingsPage.showNotifications')}
              onChange={switchShowNotifications}
              checked={app.showNotifications}
            />
            <Divider size={2} />
            <CustomDropDown
              name={t('AppSettingsPage.language')}
              id="language-select"
              options={[
                { value: 'en', text: 'English' },
                { value: 'de', text: 'Deutsch' },
              ]}
              selected={language}
              handleChange={handleChange}
            />
            <Divider size={4} />
            {t('AppSettingsPage.connectTo')}
            <Divider size={2} />
            <img
              src={SpotifyLogo}
              width={150}
              style={{ cursor: 'pointer' }}
              onClick={createSpotifyAuth}
            />
            <Divider size={2} />
            <img
              src={ListenMoeLogo}
              width={150}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setListenMoeOpen(true);
              }}
            />
          </SettingsColumn>
          <SettingsColumn>
            {user.roles.find((role: string) => role === 'admin') && (
              <>
                Developer Tools:
                <Divider size={2} />
                <CustomSwitch
                  label={t('AppSettingsPage.devMode')}
                  onChange={activateDevMode}
                  checked={app.devMode}
                />
                <Divider size={2} />
                <CustomButton
                  key="deselectTrack"
                  onClick={deselectTrack}
                  name="Deselect Track"
                />
                <Divider size={2} />
                <CustomButton
                  key="deselectPlaylist"
                  onClick={deselectPlaylist}
                  name="Deselect Playlist"
                />
              </>
            )}
          </SettingsColumn>
        </SettingsContainer>
        <CustomListDialog
          createListItem={() => {}}
          dialogTitle={t('Spotify.importPlaylist')}
          open={spotifyPlaylistsOpen}
          onSelect={handleListSelected}
          handleClose={handleClose}
          options={spotifyListnames.map(({ name, id }) => {
            return {
              name,
              id,
            };
          })}
        />
        <ListenMoeLoginDialog
          open={listenMoeOpen}
          handleClose={handleClose}
          setUsername={setListenMoeUsername}
          setPassword={setListenMoePassword}
          handleLoginClick={handleLoginClick}
          handleCancelClick={handleCancelClick}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '56px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '184px',
          }}
        >
          <InfoText>App v{process.env.version}</InfoText>
          <InfoText>externalPlayer v{player.externalPlayerVersion}</InfoText>
        </div>
      </Container>
    </ClickAwayListener>
  );
};

export default observer(AccountPage);
