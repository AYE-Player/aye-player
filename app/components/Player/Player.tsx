import { observer } from "mobx-react-lite";
import React from "react";
import ReactPlayer from "react-player";
import styled from "styled-components";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import PlayerControls from "./PlayerControls";
const AyeLogo = require("../../images/aye_temp_logo.png");

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

/*const PlayerOverlay = styled.img`
  width: 320px;
  height: 210px;
  background-color: #000;
  position: absolute;
  margin-top: 42px;
  z-index: 999;
`;*/

let playerElement: any;

const Player: React.FunctionComponent<IPlayerProps> = () => {
  const Store = ({ player, playlists, queue }: RootStoreModel) => ({
    player,
    queue,
    playlists
  });

  const { player, queue } = useInject(Store);

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
    const track = queue.nextTrack();

    if (!track) {
      if (player.loopPlaylist && player.isShuffling) {
        queue.addTracks(player.currentPlaylist.tracks);
        queue.shuffel();
        player.playTrack(queue.tracks[0]);
      } else if (player.loopPlaylist) {
        queue.addTracks(player.currentPlaylist.tracks);
        player.playTrack(player.currentPlaylist.tracks[0]);
      } else {
        player.togglePlayingState();
      }
      return;
    }

    player.playTrack(track);
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
      queue.addTracks(player.currentPlaylist.tracks);
      queue.shuffel();
    } else {
      const idx = player.currentPlaylist.getIndexOfTrack(player.currentTrack);

      queue.clear();
      queue.addTracks(player.currentPlaylist.getTracksStartingFrom(idx));
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
      {/*player.currentTrack && user.isAdmin && (
        <PlayerOverlay
          src={`https://img.youtube.com/vi/${player.currentTrack.id}/hqdefault.jpg`}
        />
      )*/}
      {!queue.isEmpty ? (
        <ReactPlayer
          ref={_getPlayerElement}
          url={`https://www.youtube.com/watch?v=${player.currentTrack.id}`}
          width="320px"
          height="210px"
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
          style={{ zIndex: "2" }}
        />
      ) : (
        <img src={AyeLogo} width="320" height="210" style={{ zIndex: 2 }} />
      )}
    </Container>
  );
};

export default observer(Player);
