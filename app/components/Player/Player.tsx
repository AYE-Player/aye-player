import React from "react";
import styled from "styled-components";
import ReactPlayer from "react-player";
import { observer } from "mobx-react-lite";
import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";

import PlayerControls from "./PlayerControls";

interface IPlayerProps {}

interface IPlayerState {
  playedSeconds: number;
  played: number;
  loadedSeconds: number;
  loaded: number;
}

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

const PlayerOverlay = styled.img`
  width: 320px;
  height: 210px;
  background-color: #000;
  position: absolute;
  margin-top: 42px;
  z-index: 999;
`;

let playerElement: any;

const Player: React.FunctionComponent<IPlayerProps> = () => {
  const Store = ({ player, playlist, queue }: RootStoreModel) => ({
    player: player,
    queue: queue,
    playlist: playlist
  });

  const { player, playlist, queue } = useInject(Store);

  const _getPlayerElement = (player: any) => {
    playerElement = player;
  };

  const _onReady = () => {
    console.log("PLAYER READY");
  };

  const _onStart = () => {};

  const _playVideo = () => {
    player.togglePlayingState();
    player.notifyRPC({});
  };

  const _stopVideo = () => {
    player.togglePlayingState();
  };

  const _pauseVideo = () => {
    player.togglePlayingState();
  };

  const _playNextTrack = () => {
    const trackId = queue.nextTrack();

    if (!trackId) {
      if (player.loopPlaylist) {
        queue.addTracks(playlist.tracks);
        player.playTrack(playlist.tracks[0]);
      } else {
        player.togglePlayingState();
      }
      return;
    }

    player.playTrack(playlist.getTrackById(trackId));
  };

  const _toggleRepeat = () => {
    if (player.loopTrack) {
      player.setLoopTrack(false);
      player.setLoopPlaylist(false);
    } else if (player.loopPlaylist) {
      player.setLoopPlaylist(false);
      player.setLoopTrack(true);
    } else {
      player.setLoopPlaylist(true);
    }
  };

  const _toggleShuffle = () => {
    player.toggleShuffleState();
    if (player.isShuffling) {
      queue.clear();
      queue.addTracks(playlist.tracks);
      queue.shuffel();
    } else {
      const idx = playlist.getIndexOfTrack(player.currentTrack);

      queue.clear();
      queue.addTracks(playlist.getTracksStartingFrom(idx));
    }
  };

  const _playPreviousTrack = () => {
    console.log("NOT IMPLEMENTED YET");
  };

  const _handleSeekMouseUp = (value: number) => {
    playerElement.seekTo(value);
    player.notifyRPC({});
  };

  const _handleProgress = (state: IPlayerState) => {
    player.setPlaybackPosition(Math.round(state.playedSeconds));
    if (
      Math.round(state.playedSeconds) >= player.currentTrack.duration - 2 &&
      player.loopTrack
    ) {
      player.setPlaybackPosition(0);
      player.notifyRPC({});
      return;
    }
  };

  const _setDuration = (duration: number) => {
    if (duration === player.currentTrack.duration) return;
    player.currentTrack.setDuration(duration);
  };

  const _onError = () => {
    console.log("error playing track, skipping");
    _playNextTrack();
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
      {player.currentTrackId && (
        <PlayerOverlay
          src={`https://img.youtube.com/vi/${player.currentTrackId}/hqdefault.jpg`}
        />
      )}
      <ReactPlayer
        ref={_getPlayerElement}
        url={`https://www.youtube.com/watch?v=${player.currentTrackId}`}
        width="320px"
        height="200px"
        playing={player.isPlaying}
        loop={player.loopTrack}
        volume={player.volume}
        muted={player.isMuted}
        onReady={() => _onReady()}
        onStart={() => _onStart()}
        onError={() => _onError()}
        onDuration={_setDuration}
        onProgress={_handleProgress}
        onEnded={() => _playNextTrack()}
      />
    </Container>
  );
};

export default observer(Player);
