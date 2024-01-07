/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
import { Grid, ThemeProvider } from '@mui/material';
import { ModelData, getSnapshot, registerRootStore } from 'mobx-keystone';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import styled from 'styled-components';
import {
  getPlaylists,
  getTracksFromPlaylist,
  getUserdata,
} from 'renderer/dataLayer/api/fetchers';
import { createTheme } from '@mui/material/styles';
import Player from '../components/Player/Player';
import QueuePlaylistSwitch from '../components/QueuePlaylistSwitch';
import { StoreProvider } from '../components/StoreProvider';
import PlayerInterop from '../dataLayer/api/PlayerInterop';
import Playlist from '../dataLayer/models/Playlist';
import Track from '../dataLayer/models/Track';
import createStore from '../dataLayer/stores/createStore';
import { Channel, Repeat } from '../../types/enums';
import MainPage from './MainPage';

interface IPlayerSettings {
  volume: number;
  playbackPosition: number;
  repeat: Repeat;
  isMuted: boolean;
  isShuffling: boolean;
  currentTrack: ModelData<Track>;
  currentPlaylist: ModelData<Playlist>;
}

export const rootStore = createStore();

registerRootStore(rootStore);

export const themeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f0ad4e',
    },
    secondary: {
      main: '#f50057',
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#f0ad4e',
    },
    warning: {
      main: '#ef6c00',
    },
  },
});

window.electron.ipcRenderer.on(Channel.APP_CLOSE, () => {
  window.electron.settings.set(
    'playerSettings.volume',
    rootStore.player.volume,
  );

  if (rootStore.player.currentTrack) {
    window.electron.settings.set(
      'playerSettings.playbackPosition',
      rootStore.player.playbackPosition,
    );
    window.electron.settings.set(
      'playerSettings.repeat',
      rootStore.player.repeat,
    );
    window.electron.settings.set(
      'playerSettings.isShuffling',
      rootStore.player.isShuffling,
    );
  }

  window.electron.settings.set(
    'playerSettings.isMuted',
    rootStore.player.isMuted,
  );

  if (rootStore.player.currentPlaylist) {
    window.electron.settings.set('playerSettings.currentPlaylist', {
      id: rootStore.player.currentPlaylist.current.id,
      trackCount: rootStore.player.currentPlaylist.current.trackCount,
      duration: rootStore.player.currentPlaylist.current.duration,
    });
  }

  if (
    rootStore.player.currentTrack?.current.id !==
    window.electron.settings.get('playerSettings.currentTrack').id
  ) {
    window.electron.settings.set(
      'playerSettings.currentTrack',
      getSnapshot(rootStore.player.currentTrack!.current),
    );
  }
});

const MainGrid = styled.div`
  height: 100%;
  width: calc(100% - 336px);
  flex-direction: column;
`;

const authenticate = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const userInfo = await getUserdata();
      rootStore.user.setData(userInfo);
    } catch (error) {
      localStorage.removeItem('token');
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error logging in ${JSON.stringify(error, null, 2)}`,
        type: 'error',
      });
    }
  }
};

const getMappedPlaylists = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const playlists = await getPlaylists();

      for (const playlist of playlists) {
        const pl = new Playlist({
          id: playlist.id,
          name: playlist.name,
          duration: playlist.duration,
          trackCount: playlist.songCount,
          tracks: [],
        });

        rootStore.playlists.add(pl);
      }
    }
  } catch (error) {
    window.electron.ipcRenderer.sendMessage(Channel.LOG, {
      message: `[Root] Error retrieving mapped Playlists ${JSON.stringify(
        error,
        null,
        2,
      )}`,
      type: 'error',
    });
  }
};

const Root = () => {
  /**
   *  Fill stores with cached information and sync with server (maybe do this in afterCreate?)
   */
  useEffect(() => {
    authenticate()
      .then(() => {
        getMappedPlaylists()
          .then(() => {
            if (window.electron.settings.has('playerSettings')) {
              const playerSettings: IPlayerSettings =
                window.electron.settings.get('playerSettings');

              // Check for playbackPosition
              if (
                playerSettings.playbackPosition &&
                !playerSettings.currentTrack?.isLivestream
              ) {
                rootStore.player.setPlaybackPosition(
                  playerSettings.playbackPosition,
                );
                PlayerInterop.setStartTime(playerSettings.playbackPosition);
              }

              // Check for currentTrack and if it was a liveStream or not
              if (!playerSettings.currentTrack?.isLivestream) {
                const currentTrack = new Track(playerSettings.currentTrack);
                if (
                  !rootStore.trackCache.tracks.find(
                    (t) => t.id === playerSettings.currentTrack.id,
                  )
                ) {
                  rootStore.trackCache.add(currentTrack);
                }
                rootStore.queue.addTrack(currentTrack);
                rootStore.player.setCurrentTrack(currentTrack);
                rootStore.player.notifyRPC({ state: 'Paused' });
                PlayerInterop.setInitValues({ track: currentTrack });
              }

              // Check for last active playlist
              if (playerSettings.currentPlaylist) {
                const playlist = rootStore.playlists.getListById(
                  playerSettings.currentPlaylist.id!,
                );
                if (!playlist) return;
                // eslint-disable-next-line promise/no-nesting
                getTracksFromPlaylist(playlist.id)
                  .then((tracks) => {
                    for (const track of tracks) {
                      const tr = new Track({
                        id: track.id,
                        duration: track.duration,
                        title: track.title,
                      });
                      if (
                        !rootStore.trackCache.tracks.find((t) => t.id === tr.id)
                      ) {
                        rootStore.trackCache.add(tr);
                      }
                      playlist.addLoadedTrack(tr);
                    }
                    rootStore.player.setCurrentPlaylist(playlist);
                  })
                  .catch((error) => {
                    window.electron.ipcRenderer.sendMessage(Channel.LOG, {
                      message: `[Root] Error retrieving Playlist songs ${error}`,
                      type: 'error',
                    });
                  });
              }

              PlayerInterop.setInitState();
            }
          })
          .catch((error) => {
            window.electron.ipcRenderer.sendMessage(Channel.LOG, {
              message: `[Root] Error retrieving Playlists ${error}`,
              type: 'error',
            });
          });
      })
      .catch((error) => {
        window.electron.ipcRenderer.sendMessage(Channel.LOG, {
          message: `Error loading settings ${error}`,

          type: 'error',
        });
      });
  }, []);

  return (
    <StoreProvider value={rootStore}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        preventDuplicate
        disableWindowBlurListener
      >
        <ThemeProvider theme={themeOptions}>
          <Grid
            container
            direction="row"
            data-tid="container"
            style={{ height: '100%' }}
          >
            <div
              style={{
                height: '100%',
                padding: '0 0 0 8px',
                borderRight: '1px solid #565f6c',
                width: '336px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <QueuePlaylistSwitch />
              <Player />
            </div>
            <MainGrid>
              <MemoryRouter>
                <MainPage />
              </MemoryRouter>
            </MainGrid>
          </Grid>
        </ThemeProvider>
      </SnackbarProvider>
    </StoreProvider>
  );
};

export default Root;
