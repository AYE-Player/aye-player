/* eslint-disable no-nested-ternary */
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components';
import ytsr from 'ytsr';
import { debugUrl, playerUrl } from 'renderer/constants';
import { getRelatedTracks } from 'renderer/dataLayer/api/fetchers';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import { Channel, IncomingMessageType, Repeat } from '../../../types/enums';
import PlayerControlsContainer from './PlayerControlsContainer';
import { timestringToSeconds } from '../../../helpers';
import { useStore } from '../StoreProvider';
import './PlayerListeners';

const AyeLogo = require('../../../images/aye_temp_logo.png');

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
    const relatedTracks = await getRelatedTracks(
      player.currentTrack?.current.id || prevTrack!.id,
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
        prevTrackRef!,
      );

      if (
        idx !== -1 &&
        idx !== player.currentPlaylist!.current.trackCount - 1
      ) {
        queue.addTracks(
          player
            .currentPlaylist!.current.getTracksStartingFrom(idx + 1)
            .map((t) => t.current),
        );
        player.playTrack(queue.currentTrack!.current);
        PlayerInterop.playTrack(queue.currentTrack!.current);
      } else if (player.repeat === Repeat.PLAYLIST && player.isShuffling) {
        queue.addTracks(
          player.currentPlaylist!.current.tracks.map((t) => t.current),
        );
        queue.shuffel();
        player.playTrack(queue.currentTrack!.current);
        PlayerInterop.setTrack(queue.currentTrack!.current);
      } else if (player.repeat === Repeat.PLAYLIST) {
        queue.addTracks(
          player.currentPlaylist!.current.tracks.map((t) => t.current),
        );
        player.playTrack(player.currentPlaylist!.current.tracks[0].current);
        PlayerInterop.setTrack(
          player.currentPlaylist!.current.tracks[0].current,
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
        player.currentPlaylist!.current.tracks.map((track) => track.current),
      );
      queue.shuffel();
    } else {
      const idx = player.currentPlaylist!.current.getIndexOfTrack(
        player.currentTrack!,
      );

      queue.clear();
      queue.addTracks(
        player
          .currentPlaylist!.current.getTracksStartingFrom(idx)
          .map((track) => track.current),
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
          .map((trackRef) => trackRef.current),
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

  window.onmessage = async (message: { origin: string; data: any }) => {
    const { data, origin } = message;
    const playerOrDebugUrl = app.devMode ? debugUrl : playerUrl;
    if (origin === playerOrDebugUrl) {
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
              player.currentTrack!.current.title,
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
              track,
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
            src={debugUrl}
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
            src={playerUrl}
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
