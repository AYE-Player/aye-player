import React from "react";
import styled from "styled-components";
import ReactPlayer from "react-player";
import { observer } from "mobx-react-lite";
import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";

import PlayerControls from "./PlayerControls";

interface IPlayerProps {}

const Container = styled.div`
  width: 216px;
  height: 296px;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  justify-content: center;
`;

const PlayerOverlay = styled.img`
  width: 216px;
  height: 200px;
  background-color: #000;
  position: absolute;
  margin-top: 42px;
  z-index: 999;
`;

/*const opts = {
  height: "200",
  width: "216",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    controls: 0
  }
};*/

let playerElement: any;

const Player: React.FunctionComponent<IPlayerProps> = () => {
  const Store = ({ player, playlist }: RootStoreModel) => ({
    player: player,
    playlist: playlist
  });

  const { player, playlist } = useInject(Store);

  const _getPlayerElement = (player: any) => {
    playerElement = player;
  };

  const _onReady = () => {
    console.log("READY");
  };

  const _onStart = () => {
    playlist
      .getTrackById(player.currentTrackId)
      .setDuration(playerElement.getDuration());
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
    const nextTrack = playlist.previewNextTrack;

    if (!nextTrack) {
      player.togglePlayingState();
      return;
    }

    player.playTrack(nextTrack);
    playlist.removeTrack(player.currentTrack);
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
      {player.currentTrackId && <PlayerOverlay
        src={`https://img.youtube.com/vi/${player.currentTrackId}/hqdefault.jpg`}
      />}
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
