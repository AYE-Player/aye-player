import { ipcRenderer } from "electron";
import { observer } from "mobx-react-lite";
import { getSnapshot } from "mobx-state-tree";
import React from "react";
import ReactPlayer from "react-player";
import styled from "styled-components";
import Root from "../../containers/Root";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import AyeLogger from "../../modules/AyeLogger";
import { LogType, Repeat } from "../../types/enums";
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

/*const PlayerOverlayImage = styled.img`
  width: 320px;
  height: 200px;
  background-color: #000;
  position: absolute;
  margin-top: 47px;
  z-index: 999;
`;*/

/*const PlayerOverlay = styled.div`
  width: 320px;
  height: 200px;
  position: absolute;
  margin-top: 47px;
  border-color: none;
  z-index: 999;
`;*/

let playerElement: any;

// Listeners
ipcRenderer.on("play-pause", (event, message) => {
  const { queue, player } = Root.stores;

  if (queue.isEmpty) {
    queue.addTracks(player.currentPlaylist.tracks);
    player.playTrack(queue.currentTrack);
  }

  player.togglePlayingState();
});

// TODO: Think about something nicer, while this is working, it feels quite strange
// to have a second local history to get tracks, there should be a way to update the
// trackHistory on change, even inside a listener
ipcRenderer.on("play-next", (event, message) => {
  console.log("PLAY NEXT");
  const { queue, player, trackHistory } = Root.stores;
  const prevTrack = player.currentTrack;
  const track = queue.nextTrack();
  console.log("NEXT TRACK", track);

  if (!track) {
    if (player.repeat === Repeat.ALL && player.isShuffling) {
      queue.addTracks(player.currentPlaylist.tracks);
      queue.shuffel();
      player.playTrack(queue.tracks[0]);
    } else if (player.repeat === Repeat.ALL) {
      queue.addTracks(player.currentPlaylist.tracks);
      player.playTrack(player.currentPlaylist.tracks[0]);
    } else {
      player.togglePlayingState();
    }
    return;
  }

  trackHistory.addTrack(prevTrack);
  console.log("REAL HIST", getSnapshot(trackHistory.tracks));
  player.playTrack(track);
});

ipcRenderer.on("play-previous", (event, message) => {
  console.log("PLAY PREV");
  const { player, queue, trackHistory } = Root.stores;
  const track = trackHistory.getLatestTrack();
  console.log("PREV TRACK", track);

  const currTrack = player.currentTrack;
  queue.addPrivilegedTrack(currTrack);

  if (!track) return;
  player.playTrack(track);
});

ipcRenderer.on("position", (event, message) => {
  playerElement.seekTo(Math.floor(message.pos));
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

  const _getPlayerElement = (player: any) => {
    playerElement = player;
  };

  const _onReady = () => {
    console.log("PLAYER READY");
    if (player.playbackPosition > 0) {
      playerElement.seekTo(player.playbackPosition);
    }
  };

  const _onStart = () => {
    console.log("STARTING");
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

  const _onPause = () => {
    if (player.isPlaying) {
      player.pause();
    }
  };

  const _playNextTrack = () => {
    const prevTrack = player.currentTrack;
    const track = queue.nextTrack();

    if (!track) {
      if (player.repeat === Repeat.ALL && player.isShuffling) {
        queue.addTracks(player.currentPlaylist.tracks);
        queue.shuffel();
        player.playTrack(queue.tracks[0]);
      } else if (player.repeat === Repeat.ALL) {
        queue.addTracks(player.currentPlaylist.tracks);
        player.playTrack(player.currentPlaylist.tracks[0]);
      } else {
        player.togglePlayingState();
      }
      return;
    }

    trackHistory.addTrack(prevTrack);

    player.setCurrentTrack();
    player.playTrack(track);
  };

  const _toggleRepeat = () => {
    if (player.repeat === Repeat.ONE) {
      player.setRepeat(Repeat.NONE);
    } else if (player.repeat === Repeat.ALL) {
      player.setRepeat(Repeat.ONE);
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
    console.log("PLAY PREV");
    const track = trackHistory.getLatestTrack();
    console.log("TRACKHIST", getSnapshot(trackHistory.tracks));
    console.log("TRACK", track);
    if (!track) return;

    queue.addPrivilegedTrack(track);
    player.playTrack(track);
  };

  const _handleSeekMouseUp = (value: number) => {
    playerElement.seekTo(value);
    player.notifyRPC();
  };

  const _handleProgress = (state: IPlayerState) => {
    if (player.currentTrack.isLivestream) {
      player.setPlaybackPosition(player.playbackPosition + 1);
    } else {
      player.setPlaybackPosition(Math.round(state.playedSeconds));
    }
    if (
      Math.round(state.playedSeconds) >= player.currentTrack.duration - 2 &&
      player.repeat === Repeat.ONE
    ) {
      player.setPlaybackPosition(0);
      player.notifyRPC();
      return;
    }
  };

  const _setDuration = (duration: number) => {
    if (duration === player.currentTrack.duration) return;
    // player.currentTrack.setDuration(duration);
  };

  const _onError = () => {
    AyeLogger.player(
      `error playing track, skipping. TrackInfo: ${JSON.stringify(
        getSnapshot(player.currentTrack),
        null,
        2
      )}`,
      LogType.ERROR
    );
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
      {player.isPlaying ? null : queue.isEmpty || !player.currentTrack ? ( // <PlayerOverlay />
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
      ) : null
      /*<PlayerOverlayImage
          src={`https://img.youtube.com/vi/${player.currentTrack.id}/hqdefault.jpg`}
        />*/
      }
      {player.currentTrack ? (
        <ReactPlayer
          ref={_getPlayerElement}
          url={`https://www.youtube.com/watch?v=${player.currentTrack.id}`}
          width="320px"
          height="202px"
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1
              },
              embedOptions: {
                controls: 0
              }
            }
          }}
          playing={player.isPlaying}
          loop={player.repeat === Repeat.ONE}
          volume={player.volume}
          muted={player.isMuted}
          onReady={() => _onReady()}
          onStart={() => _onStart()}
          onPause={() => _onPause()}
          onError={() => _onError()}
          onDuration={_setDuration}
          onProgress={_handleProgress}
          onEnded={() => _playNextTrack()}
          style={{
            zIndex: 2
          }}
        />
      ) : (
        <div style={{ width: "320px", height: "202px" }}></div>
      )}
    </Container>
  );
};

export default observer(Player);
