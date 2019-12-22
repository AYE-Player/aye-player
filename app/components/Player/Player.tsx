import { ipcRenderer } from "electron";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import Root from "../../containers/Root";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import AyeLogger from "../../modules/AyeLogger";
import { LogType, Repeat, IncomingMessageType } from "../../types/enums";
import PlayerControls from "./PlayerControls";
import trackRef from "../../dataLayer/references/TrackRef";
const AyeLogo = require("../../images/aye_temp_logo.png");

interface IPlayerProps {}

const Container = styled.div`
  width: 320px;
  height: 296px;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  justify-content: center;
  position: absolute;
  bottom: 32px;
`;

// Listeners
ipcRenderer.on("play-pause", (event, message) => {
  const { queue, player } = Root.stores;

  if (queue.isEmpty) {
    queue.addTracks(player.currentPlaylist.current.tracks.map(track => track.current));
    player.playTrack(queue.currentTrack.current);
    PlayerInterop.playTrack(queue.currentTrack.current);
  }

  player.togglePlayingState();
  PlayerInterop.togglePlayingState();
});

ipcRenderer.on("play-next", (event, message) => {
  const { queue, player, trackHistory } = Root.stores;
  const prevTrack = player.currentTrack;
  const track = queue.nextTrack();

  if (!track) {
    if (player.repeat === Repeat.ALL && player.isShuffling) {
      queue.addTracks(player.currentPlaylist.current.tracks.map(track => track.current));
      queue.shuffel();
      player.playTrack(queue.tracks[0].current);
      PlayerInterop.playTrack(queue.tracks[0].current);
    } else if (player.repeat === Repeat.ALL) {
      queue.addTracks(player.currentPlaylist.current.tracks.map(track => track.current));
      player.playTrack(player.currentPlaylist.current.tracks[0].current);
      PlayerInterop.playTrack(player.currentPlaylist.current.tracks[0].current);
    } else {
      player.togglePlayingState();
      PlayerInterop.togglePlayingState();
    }
    return;
  }

  trackHistory.addTrack(prevTrack);
  player.playTrack(track.current);
  PlayerInterop.playTrack(track.current);
});

ipcRenderer.on("play-previous", (event, message) => {
  const { player, queue, trackHistory } = Root.stores;
  const track = trackHistory.removeAndGetTrack();
  if (!track) return;

  queue.addPrivilegedTrack(player.currentTrack.current);

  player.playTrack(track.current);
  PlayerInterop.playTrack(track.current);
});

ipcRenderer.on("position", (event, message) => {
  PlayerInterop.seekTo(message.pos);
});

const Player: React.FunctionComponent<IPlayerProps> = () => {
  const Store = ({
    player,
    playlists,
    queue,
    trackHistory,
    app
  }: RootStore) => ({
    player,
    queue,
    playlists,
    trackHistory,
    app
  });

  const { player, queue, trackHistory, app } = useInject(Store);
  PlayerInterop.init();

  window.onmessage = (message: any) => {
    const { data, origin } = message;
    const playerUrl = app.devMode
      ? "http://localhost:3000"
      : "https://player.aye-player.de";
    if (origin === playerUrl) {
      switch (data.type) {
        case IncomingMessageType.SET_PLAYBACK_POSITION:
          if (data.playbackPosition === 0) return;
          const oldPosition = player.playbackPosition;
          player.setPlaybackPosition(data.playbackPosition);
          if (data.playbackPosition < oldPosition) {
            player.notifyRPC();
          }
          break;
        case IncomingMessageType.PLAY_NEXT_TRACK:
          _playNextTrack();
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
          AyeLogger.player(
            `Error from External Player ${JSON.stringify(data.error)}`,
            LogType.ERROR
          );
          break;
        default:
          break;
      }
    }
  };

  const _playVideo = () => {
    PlayerInterop.togglePlayingState();
    player.togglePlayingState();
  };

  const _stopVideo = () => {
    PlayerInterop.togglePlayingState();
    player.togglePlayingState();
  };

  const _pauseVideo = () => {
    PlayerInterop.togglePlayingState();
    player.togglePlayingState();
  };

  const _playNextTrack = () => {
    const prevTrack = player.currentTrack;
    console.log("PREV TRACK", prevTrack);
    const track = queue.nextTrack();
    console.log("NEXT RACK", track);

    if (!track) {
      if (player.repeat === Repeat.ALL && player.isShuffling) {
        queue.addTracks(player.currentPlaylist.current.tracks.map(track => track.current));
        queue.shuffel();
        player.playTrack(queue.tracks[0].current);
        PlayerInterop.setTrack(queue.tracks[0].current);
      } else if (player.repeat === Repeat.ALL) {
        queue.addTracks(player.currentPlaylist.current.tracks.map(track => track.current));
        player.playTrack(player.currentPlaylist.current.tracks[0].current);
        PlayerInterop.setTrack(player.currentPlaylist.current.tracks[0].current);
      } else if (
        player.currentPlaylist.current?.getTrackById(prevTrack.id) &&
        player.currentPlaylist.current.getIndexOfTrack(prevTrack) + 1 <
          player.currentPlaylist.current.trackCount
      ) {
        const idx = player.currentPlaylist.current.getIndexOfTrack(prevTrack);
        queue.addTracks(
          player.currentPlaylist.current.getTracksStartingFrom(idx + 1).map(track => track.current)
        );
        player.playTrack(queue.tracks[0].current);
        PlayerInterop.playTrack(queue.tracks[0].current);
      } else {
        player.togglePlayingState();
        PlayerInterop.togglePlayingState();
        player.setCurrentTrack();
        PlayerInterop.setTrack();
        player.notifyRPC({ state: "Idle" });
      }
      return;
    }

    console.log("ADD TRRACK TO HIST");
    trackHistory.addTrack(trackRef(prevTrack.current));

    player.setCurrentTrack();
    console.log("PLAY TRACK");
    player.playTrack(track.current);
    PlayerInterop.playTrack(track.current);
  };

  const _toggleRepeat = () => {
    if (player.repeat === Repeat.ONE) {
      player.setRepeat(Repeat.NONE);
      PlayerInterop.setLooping(false);
    } else if (player.repeat === Repeat.ALL) {
      player.setRepeat(Repeat.ONE);
      PlayerInterop.setLooping(true);
    } else {
      player.setRepeat(Repeat.ALL);
    }
  };

  const _toggleShuffle = () => {
    player.toggleShuffleState();
    if (player.isShuffling) {
      queue.clear();
      queue.addTracks(player.currentPlaylist.current.tracks.map(track => track.current));
      queue.shuffel();
    } else {
      const idx = player.currentPlaylist.current.getIndexOfTrack(
        player.currentTrack
      );

      queue.clear();
      queue.addTracks(
        player.currentPlaylist.current.getTracksStartingFrom(idx).map(track => track.current)
      );
    }
  };

  const _playPreviousTrack = () => {
    const track = trackHistory.removeAndGetTrack();
    if (!track) return;

    queue.addPrivilegedTrack(track.current);
    player.playTrack(track.current);
    PlayerInterop.setTrack(track.current);
  };

  const _handleSeekMouseUp = (value: number) => {
    PlayerInterop.seekTo(value);
    player.notifyRPC();
  };

  return (
    <Container>
      <PlayerControls
        play={() => _playVideo()}
        stop={() => _stopVideo()}
        pause={() => _pauseVideo()}
        toggleRepeat={() => _toggleRepeat()}
        shuffle={() => _toggleShuffle()}
        skip={() => _playNextTrack()}
        previous={() => _playPreviousTrack()}
        seekingStop={_handleSeekMouseUp}
      />
      {!player.isPlaying && !player.currentTrack ? (
        <img
          src={AyeLogo}
          style={{
            width: "320px",
            height: "200px",
            position: "absolute",
            marginTop: "45px",
            borderColor: "none",
            backgroundColor: "#232c39",
            zIndex: 999
          }}
        />
      ) : null}
      <div
        style={{
          width: "320px",
          height: "215px",
          overflow: "hidden"
        }}
      >
        {app.devMode ? (
          <iframe
            id="embedded-player"
            src="http://localhost:3000"
            style={{
              width: "320px",
              height: "215px",
              overflow: "hidden",
              border: "none"
            }}
          />
        ) : (
          <iframe
            id="embedded-player"
            src="https://player.aye-player.de"
            style={{
              width: "320px",
              height: "215px",
              overflow: "hidden",
              border: "none"
            }}
          />
        )}
      </div>
    </Container>
  );
};

export default observer(Player);
