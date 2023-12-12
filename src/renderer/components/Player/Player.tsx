/* eslint-disable no-nested-ternary */
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ytsr from 'ytsr';
import ApiClient from '../../dataLayer/api/ApiClient';
import ListenMoeWebsocket from '../../dataLayer/api/ListenMoeWebsocket';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import { Channel, IncomingMessageType, Repeat } from '../../../types/enums';
import { IListenMoeSongUpdate } from '../../../types/response';
import PlayerControlsContainer from './PlayerControlsContainer';
import ListenMoeApiClient from '../../dataLayer/api/ListenMoeApiClient';
import { timestringToSeconds } from '../../../helpers';
import { useStore } from '../StoreProvider';
import './PlayerListeners';

const AyeLogo = require('../../../images/aye_temp_logo.png');
const ListenMoe = require('../../../images/listenmoe.svg');

const Container = styled.div`
  width: 320px;
  height: 320px;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  justify-content: center;
  position: absolute;
  bottom: 0px;
`;

let retryCounter = 0;

const Player: React.FunctionComponent = () => {
  const { player, queue, trackHistory, app, trackCache } = useStore();
  PlayerInterop.init();

  const playVideo = () => {
    PlayerInterop.togglePlayingState();
    player.togglePlayingState();
  };

  const pauseVideo = () => {
    PlayerInterop.togglePlayingState();
    player.togglePlayingState();
  };

  const getNextRadioTracks = async (prevTrack?: Track) => {
    const relatedTracks = await ApiClient.getRelatedTracks(
      player.currentTrack?.current.id || prevTrack!.id
    );
    const tracks: Track[] = [];
    for (const trk of relatedTracks) {
      let track: Track;
      if (!trackCache.getTrackById(trk.id)) {
        track = new Track({
          id: trk.id,
          title: trk.title,
          duration: trk.duration,
        });
        trackCache.add(track);
      } else {
        track = trackCache.getTrackById(trk.id)!;
      }
      tracks.push(track);
    }
    queue.addTracks(tracks);
  };

  const playNextTrack = async () => {
    const prevTrackRef = player.currentTrack;
    const prevTrack = prevTrackRef!.current;
    const track = queue.nextTrack();

    if (!track) {
      const idx = player.currentPlaylist!.current.getIndexOfTrack(
        prevTrackRef!
      );

      if (
        idx !== -1 &&
        idx !== player.currentPlaylist!.current.trackCount - 1
      ) {
        queue.addTracks(
          player
            .currentPlaylist!.current.getTracksStartingFrom(idx + 1)
            .map((t) => t.current)
        );
        player.playTrack(queue.currentTrack!.current);
        PlayerInterop.playTrack(queue.currentTrack!.current);
      } else if (player.repeat === Repeat.PLAYLIST && player.isShuffling) {
        queue.addTracks(
          player.currentPlaylist!.current.tracks.map((t) => t.current)
        );
        queue.shuffel();
        player.playTrack(queue.currentTrack!.current);
        PlayerInterop.setTrack(queue.currentTrack!.current);
      } else if (player.repeat === Repeat.PLAYLIST) {
        queue.addTracks(
          player.currentPlaylist!.current.tracks.map((t) => t.current)
        );
        player.playTrack(player.currentPlaylist!.current.tracks[0].current);
        PlayerInterop.setTrack(
          player.currentPlaylist!.current.tracks[0].current
        );
      } else if (app.autoRadio) {
        await getNextRadioTracks(prevTrack);

        trackHistory.addTrack(prevTrack);

        player.setCurrentTrack();
        player.playTrack(queue.currentTrack!.current);
        PlayerInterop.playTrack(queue.currentTrack!.current);
      } else {
        player.togglePlayingState();
        PlayerInterop.togglePlayingState();
        player.setCurrentTrack();
        PlayerInterop.setTrack();
        player.notifyRPC({ state: 'Idle' });
      }
    } else {
      if (queue.tracks.length <= 3 && player.radioActive) {
        getNextRadioTracks();
      }
      trackHistory.addTrack(prevTrack);

      player.setCurrentTrack();
      player.playTrack(track.current);
      PlayerInterop.playTrack(track.current);
    }
  };

  const toggleRepeat = () => {
    if (player.repeat === Repeat.ONE) {
      player.setRepeat(Repeat.NONE);
      PlayerInterop.setLooping(false);
    } else if (player.repeat === Repeat.PLAYLIST) {
      player.setRepeat(Repeat.ONE);
      PlayerInterop.setLooping(true);
    } else {
      player.setRepeat(Repeat.PLAYLIST);
    }
  };

  const toggleShuffle = () => {
    player.toggleShuffleState();
    if (player.isShuffling) {
      queue.clear();
      queue.addTracks(
        player.currentPlaylist!.current.tracks.map((track) => track.current)
      );
      queue.shuffel();
    } else {
      const idx = player.currentPlaylist!.current.getIndexOfTrack(
        player.currentTrack!
      );

      queue.clear();
      queue.addTracks(
        player
          .currentPlaylist!.current.getTracksStartingFrom(idx)
          .map((track) => track.current)
      );
    }
  };

  const playPreviousTrack = () => {
    let track: Track | undefined;
    const currentTrackPlaylistIdx =
      player.currentPlaylist?.current.getIndexOfTrack(player.currentTrack!);
    if (
      trackHistory.tracks.length === 0 &&
      player.currentPlaylist &&
      currentTrackPlaylistIdx
    ) {
      track =
        player.currentPlaylist.current.tracks[currentTrackPlaylistIdx - 1]
          .current;

      queue.addTracks(
        player.currentPlaylist.current
          .getTracksStartingFrom(currentTrackPlaylistIdx + 1)
          .map((trackRef) => trackRef.current)
      );
    } else if (trackHistory.tracks.length) {
      track = trackHistory.removeAndGetTrack();
      queue.addPrivilegedTrack(track);
    }

    if (!track) return;

    player.playTrack(track);
    PlayerInterop.setTrack(track);
  };

  const handleSeekMouseUp = (value: number) => {
    PlayerInterop.seekTo(value);
    player.notifyRPC();
  };

  const favoriteSong = () => {
    player.favoriteSong();
  };

  const deFavoriteSong = () => {
    player.deFavoriteSong();
  };

  window.onmessage = async (message: { origin: string; data: any }) => {
    const { data, origin } = message;
    const playerUrl = app.devMode
      ? 'http://localhost:3000'
      : 'https://player.aye-playr.de';
    if (origin === playerUrl) {
      switch (data.type) {
        case IncomingMessageType.SET_PLAYBACK_POSITION:
          if (data.playbackPosition === 0 && data.isLooping) {
            player.setPlaybackPosition(data.playbackPosition);
            player.notifyRPC();
          }
          if (data.playbackPosition === 0) return;
          player.setPlaybackPosition(data.playbackPosition);
          if (
            data.playbackPosition < player.playbackPosition &&
            player.currentTrack
          ) {
            player.notifyRPC();
          }
          break;
        case IncomingMessageType.PLAY_NEXT_TRACK:
          playNextTrack();
          break;
        case IncomingMessageType.START:
          if (!player.isPlaying) {
            player.togglePlayingState();
          }
          break;
        case IncomingMessageType.PAUSE:
          if (player.isPlaying) {
            player.togglePlayingState();
            if (player.websocketConnected) {
              window.electron.ipcRenderer.sendMessage(Channel.STREAM_PAUSED);
            }
          }
          break;
        case IncomingMessageType.ERROR:
          window.electron.ipcRenderer.sendMessage(Channel.LOG, {
            message: `Error from External Player ${JSON.stringify(data.error)}`,
            type: 'error',
          });
          if (data.error === 150) {
            if (retryCounter >= 2) {
              retryCounter = 0;
              playNextTrack();
            }

            // Search youtube for new track
            const replacementTracks = await window.electron.youtube.search(
              player.currentTrack!.current.title
            );

            const replacementTrack = replacementTracks.items[
              retryCounter
            ] as ytsr.Video;

            // create local track
            const track = new Track({
              id: replacementTrack.url.split('watch?v=')[1],
              title: replacementTrack.title,
              duration: timestringToSeconds(replacementTrack.duration || '0'),
            });

            // add to cache
            trackCache.add(track);

            // replace track in playlist
            player.currentPlaylist!.current.replaceTrack(
              player.currentTrack!,
              track
            );

            // play the track
            player.playTrack(track);
            PlayerInterop.playTrack(track);

            // increase retry counter to stop infinite retries
            retryCounter += 1;
          } else {
            playNextTrack();
          }
          break;
        case IncomingMessageType.READY:
          player.setExternalPlayerVersion(data.version);
          break;
        default:
          break;
      }
    }
  };

  // Handle listenmoe websocket song updates
  if (player.websocketConnected) {
    ListenMoeWebsocket.ws!.onmessage = async (message) => {
      if (!message.data.length) return;
      let response: IListenMoeSongUpdate;
      try {
        response = JSON.parse(message.data);
      } catch (error) {
        return;
      }
      switch (response.op) {
        case 0:
          ListenMoeWebsocket.ws!.send(JSON.stringify({ op: 9 }));
          ListenMoeWebsocket.sendHeartbeat(response.d.heartbeat);
          break;
        case 1:
          if (
            response.t !== 'TRACK_UPDATE' &&
            response.t !== 'TRACK_UPDATE_REQUEST' &&
            response.t !== 'QUEUE_UPDATE' &&
            response.t !== 'NOTIFICATION'
          )
            break;

          // eslint-disable-next-line no-case-declarations
          let favorite: number[] = [];
          if (app.listenMoeLoggedIn) {
            favorite = await ListenMoeApiClient.checkFavorite([
              response.d.song.id,
            ]).catch((err) => {
              window.electron.ipcRenderer.sendMessage(Channel.LOG, {
                message: `[ListenMoe] Error checking for favorite entry ${JSON.stringify(
                  err
                )}`,

                type: 'error',
              });
              return [];
            });
          }

          if (player.currentTrack) {
            player.setCurrentTrack();
          }

          player.setListenMoeData({
            id: response.d.song.id,
            startTime: response.d.startTime,
            artists:
              response.d.song.artists
                ?.map((artist) => artist.name)
                .toString() ?? '<no artist>',
            title: response.d.song.title ?? '<no title>',
            duration: response.d.song.duration ?? 0,
            favorite: favorite.includes(response.d.song.id),
          });
          player.notifyRPC();
          break;
        default:
          break;
      }
    };

    // listen for errors / disconnects
    ListenMoeWebsocket.ws!.onclose = () => {
      clearInterval(ListenMoeWebsocket.heartbeatInterval);
      ListenMoeWebsocket.heartbeatInterval = undefined;
      if (ListenMoeWebsocket.ws) {
        ListenMoeWebsocket.ws.close();
        ListenMoeWebsocket.ws = undefined;
        player.setWebsocketConnected(false);
      }
      /* if (!error.wasClean) {
        console.log("%c> [ListenMoe] Reconnecting...", "color: #008000;");
        setTimeout(() => {
          player.setLivestreamSource("listen.moe");
        }, 5000);
        player.setWebsocketConnected(false);
        player.setListenMoeData(undefined);
      } */
    };
  }

  return (
    <Container>
      <PlayerControlsContainer
        play={playVideo}
        pause={pauseVideo}
        toggleRepeat={toggleRepeat}
        shuffle={toggleShuffle}
        skip={playNextTrack}
        previous={playPreviousTrack}
        seekingStop={handleSeekMouseUp}
      />
      {!player.isPlaying && !player.currentTrack ? (
        <img
          src={AyeLogo}
          style={{
            width: '320px',
            height: '200px',
            position: 'absolute',
            marginTop: '34px',
            borderColor: 'none',
            backgroundColor: '#161618',
            zIndex: 999,
          }}
          alt="aye-logo"
        />
      ) : null}
      {player.livestreamSource === 'listen.moe' ? (
        <>
          <img
            src={ListenMoe}
            style={{
              width: '320px',
              height: '200px',
              position: 'absolute',
              marginTop: '35px',
              borderColor: 'none',
              backgroundColor: '#161618',
              zIndex: 999,
            }}
            alt="listenmoe-logo"
          />
          {player.listenMoeTrackData && (
            <div
              style={{
                zIndex: 1000,
                position: 'absolute',
                bottom: '32px',
                width: '264px',
                height: '48px',
              }}
            >
              {player.listenMoeTrackData.title}{' '}
              {player.listenMoeTrackData.artists
                ? `- ${
                    player.listenMoeTrackData.artists.length >= 20
                      ? `${player.listenMoeTrackData.artists.substring(
                          0,
                          20
                        )}...`
                      : player.listenMoeTrackData.artists
                  }`
                : ''}
            </div>
          )}
          {app.listenMoeLoggedIn ? (
            player.listenMoeTrackData && player.listenMoeTrackData.favorite ? (
              <FavoriteIcon
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  bottom: '0px',
                  right: '5px',
                }}
                onClick={deFavoriteSong}
              />
            ) : (
              <FavoriteBorderOutlinedIcon
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  bottom: '0px',
                  right: '5px',
                }}
                onClick={favoriteSong}
              />
            )
          ) : null}
        </>
      ) : null}
      <div
        style={{
          width: '320px',
          height: '290px',
          overflow: 'hidden',
        }}
      >
        {app.devMode ? (
          <iframe
            id="embedded-player"
            src="http://localhost:3000"
            style={{
              width: '320px',
              height: '290px',
              overflow: 'hidden',
              border: 'none',
            }}
            title="embedded-player"
          />
        ) : (
          <iframe
            id="embedded-player"
            src="https://player.aye-playr.de"
            style={{
              width: '320px',
              height: '290px',
              overflow: 'hidden',
              border: 'none',
            }}
            title="embedded-player"
          />
        )}
      </div>
    </Container>
  );
};

export default observer(Player);