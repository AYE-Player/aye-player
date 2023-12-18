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
import { Channel } from '../../types/enums';
import CustomDropDown from '../components/Customs/CustomDropDown';
import CustomListDialog from '../components/Customs/CustomListDialog';
import CustomSwitch from '../components/Customs/CustomSwitch';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import Track from '../dataLayer/models/Track';
import { getSpotifyPlaylists } from '../../helpers';
import spotifyPlaylistToLocalTracks from '../../helpers/spotify/spotifyPlaylistToLocalTracks';
import { useStore } from '../components/StoreProvider';

const SpotifyLogo = require('../../images/Spotify_Logo_CMYK_Green.png');

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 6rem;
`;

const Container = styled.div``;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10rem;
`;

const InfoText = styled.div`
  font-size: 12px;
`;
const SettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AccountPage: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { app, playlists, trackCache, player } = useStore();

  const [spotifyListnames, setSpotifyListNames] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [spotifyLists, setSpotifyLists] = React.useState<ISpotifyPlaylist[]>(
    []
  );
  const [spotifyPlaylistsOpen, setSpotifyPlaylistsOpen] = React.useState(false);

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
          <InfoText>App v{window.electron.process.env.version}</InfoText>
          <InfoText>externalPlayer v{player.externalPlayerVersion}</InfoText>
        </div>
      </Container>
    </ClickAwayListener>
  );
};

export default observer(AccountPage);
