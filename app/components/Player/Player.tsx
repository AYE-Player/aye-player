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
  width: 216px;
  height: 296px;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  justify-content: center;
  position: absolute;
  bottom: 35px;
`;

const PlayerOverlay = styled.img`
  width: 216px;
  height: 200px;
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
    console.log("READY");
  };

  const _onStart = () => {
    if (playerElement.getDuration() === 0) _playNextTrack();
    player.currentTrack.setDuration(playerElement.getDuration());
  };

  const _playVideo = () => {
    player.togglePlayingState();
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
      player.togglePlayingState();
      return;
    }

    const track = playlist.getTrackById(trackId);
    player.playTrack(track);
  };

  const _toggleRepeat = () => {
    if (player.loopTrack) {
      player.setLoopTrack(false);
      player.setRepeatPlaylist(false);
    } else if (player.repeatPlaylist) {
      player.setRepeatPlaylist(false);
      player.setLoopTrack(true);
    } else {
      player.setRepeatPlaylist(true);
    }
  };

  const _toggleShuffle = () => {
    player.toggleShuffleState();
  };

  const _playPreviousTrack = () => {
    console.log("NOT IMPLEMENTED YET");
  };

  const _handleSeekMouseUp = (value: number) => {
    playerElement.seekTo(value);
  };

  const _handleProgress = (state: IPlayerState) => {
    player.setPlaybackPosition(Math.trunc(state.playedSeconds));
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
        width="216px"
        height="200px"
        playing={player.isPlaying}
        loop={player.loopTrack}
        volume={player.volume}
        muted={player.isMuted}
        onReady={() => _onReady()}
        onStart={() => _onStart()}
        onProgress={_handleProgress}
        onEnded={() => _playNextTrack()}
      />
    </Container>
  );
};

export default observer(Player);
