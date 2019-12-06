import { ipcRenderer } from "electron";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import Root from "../../containers/Root";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import AyeLogger from "../../modules/AyeLogger";
import { LogType, Repeat } from "../../types/enums";
import PlayerControls from "./PlayerControls";
const AyeLogo = require("../../images/aye_temp_logo.png");

interface IPlayerProps {}

const Container = styled.div`
  width: 320px;
  height: 296px;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  justify-content: center;
  position: absolute;
  bottom: 35px;
`;

// Listeners
ipcRenderer.on("play-pause", (event, message) => {
  const { queue, player } = Root.stores;

  if (queue.isEmpty) {
    queue.addTracks(player.currentPlaylist.tracks);
    player.playTrack(queue.currentTrack);
    PlayerInterop.playTrack(queue.currentTrack);
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
      queue.addTracks(player.currentPlaylist.tracks);
      queue.shuffel();
      player.playTrack(queue.tracks[0]);
      PlayerInterop.playTrack(queue.tracks[0]);
    } else if (player.repeat === Repeat.ALL) {
      queue.addTracks(player.currentPlaylist.tracks);
      player.playTrack(player.currentPlaylist.tracks[0]);
      PlayerInterop.playTrack(player.currentPlaylist.tracks[0]);
    } else {
      player.togglePlayingState();
      PlayerInterop.togglePlayingState();
    }
    return;
  }

  trackHistory.addTrack(prevTrack.id);
  player.playTrack(track);
  PlayerInterop.playTrack(track);
});

ipcRenderer.on("play-previous", (event, message) => {
  const { player, queue, trackHistory } = Root.stores;
  const track = trackHistory.removeAndGetTrack();
  if (!track) return;

  queue.addPrivilegedTrack(player.currentTrack);

  player.playTrack(track);
  PlayerInterop.playTrack(track);
});

ipcRenderer.on("position", (event, message) => {
  PlayerInterop.seekTo(message.pos);
});

const Player: React.FunctionComponent<IPlayerProps> = () => {
  const Store = ({
    player,
    playlists,
    queue,
    trackHistory
  }: RootStoreModel) => ({
    player,
    queue,
    playlists,
    trackHistory
  });

  const { player, queue, trackHistory } = useInject(Store);
  PlayerInterop.init();

  window.onmessage = (m: any) => {
    if (m.origin === "https://player.aye-player.de") {
      if (m.data.type === "setPlaybackPosition") {
        player.setPlaybackPosition(m.data.playbackPosition);
      } else if (m.data.type === "playNextTrack") {
        _playNextTrack();
      } else if (m.data.type === "error") {
        AyeLogger.player(
          `Error from External Player ${JSON.stringify(m.data.error)}`,
          LogType.ERROR
        );
      }
    }
  };

  const _playVideo = () => {
    PlayerInterop.setTrack(player.currentTrack);
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
    const track = queue.nextTrack();

    if (!track) {
      if (player.repeat === Repeat.ALL && player.isShuffling) {
        queue.addTracks(player.currentPlaylist.tracks);
        queue.shuffel();
        player.playTrack(queue.tracks[0]);
        PlayerInterop.setTrack(queue.tracks[0]);
      } else if (player.repeat === Repeat.ALL) {
        queue.addTracks(player.currentPlaylist.tracks);
        player.playTrack(player.currentPlaylist.tracks[0]);
        PlayerInterop.setTrack(player.currentPlaylist.tracks[0]);
      } else {
        player.togglePlayingState();
        PlayerInterop.togglePlayingState();
        player.setCurrentTrack();
        PlayerInterop.setTrack();
      }
      return;
    }

    trackHistory.addTrack(prevTrack.id);

    player.setCurrentTrack();
    PlayerInterop.setTrack();
    player.playTrack(track);
    PlayerInterop.setTrack(track);
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
      queue.addTracks(player.currentPlaylist.tracks);
      queue.shuffel();
    } else {
      const idx = player.currentPlaylist.getIndexOfTrack(player.currentTrack);

      queue.clear();
      queue.addTracks(player.currentPlaylist.getTracksStartingFrom(idx));
    }
  };

  const _playPreviousTrack = () => {
    const track = trackHistory.removeAndGetTrack();
    if (!track) return;

    queue.addPrivilegedTrack(track);
    player.playTrack(track);
    PlayerInterop.setTrack(track);
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
            marginTop: "48px",
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
      </div>
    </Container>
  );
};

export default observer(Player);
