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
  const PlayerStore = ({ player, playlist }: RootStoreModel) => ({
    player: player,
    playlist: playlist
  });

  const { player, playlist } = useInject(PlayerStore);

  const _getPlayerElement = player => {
    playerElement = player;
  };

  const _onReady = () => {
    console.log("READY");
  };

  const _onStart = () => {
    player.setDuration(playerElement.getDuration());
  }

  const _playVideo = () => {
    player.togglePlayingState();
  };

  const _stopVideo = () => {
    player.togglePlayingState();
  };

  const _pauseVideo = () => {
    player.togglePlayingState();
  };

  const _playNextSong = () => {
    const nextTrack = playlist.nextTrack();
    if (!nextTrack) {
      player.togglePlayingState();
      return;
    }

    player.playTrack(nextTrack);
  };

  const _toggleRepeat = () => {
    if (player.repeatOneStatus) {
      player.setRepeatOne(false);
      player.setRepeat(false);
    } else if (player.repeat) {
      player.setRepeat(false);
      player.setRepeatOne(true);
    } else {
      player.setRepeat(true);
    }
  };

  const _toggleShuffle = () => {
    player.toggleShuffleState();
  };

  const _playPreviousSong = () => {
    console.log("NOT IMPLEMENTED YET");
  };

  const _handleSeekMouseUp = (value: number) => {
    playerElement.seekTo(value);
  };

  const _handleProgress = state => {
    player.setPlaybackPosition(parseInt(state.playedSeconds));
  };

  return (
    <Container>
      <PlayerControls
        play={() => _playVideo()}
        stop={() => _stopVideo()}
        pause={() => _pauseVideo()}
        toggleRepeat={() => _toggleRepeat()}
        shuffle={() => _toggleShuffle()}
        skip={() => _playNextSong()}
        previous={() => _playPreviousSong()}
        seekingStop={_handleSeekMouseUp}
      />
      <PlayerOverlay
        src={`https://img.youtube.com/vi/${player.videoId}/hqdefault.jpg`}
      />
      <ReactPlayer
        ref={_getPlayerElement}
        url={`https://www.youtube.com/watch?v=${player.videoId}`}
        width="216px"
        height="200px"
        playing={player.isPlaying}
        loop={player.repeatOneStatus}
        volume={player.getVolume}
        muted={player.isMuted}
        onReady={() => _onReady()}
        onStart={() => _onStart()}
        onProgress={_handleProgress}
        onEnded={() => _playNextSong()}
      />
    </Container>
  );
};

export default observer(Player);
