import { ipcRenderer } from "electron";
import { observer } from "mobx-react-lite";
import { getSnapshot } from "mobx-state-tree";
import React from "react";
import styled from "styled-components";
import Root from "../../containers/Root";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
//import AyeLogger from "../../modules/AyeLogger";
import { /*LogType,*/ Repeat } from "../../types/enums";
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
  const PE = document.querySelector("#embedded-player") as any;
  console.log("PE", PE);

  if (queue.isEmpty) {
    queue.addTracks(player.currentPlaylist.tracks);
    player.playTrack(queue.currentTrack);
    PE.contentWindow.postMessage(
      {
        type: "playTrack",
        track: getSnapshot(queue.currentTrack)
      },
      "https://player.aye-player.de"
    );
  }

  player.togglePlayingState();
  PE.contentWindow.postMessage(
    {
      type: "togglePlayingState"
    },
    "https://player.aye-player.de"
  );
});

ipcRenderer.on("play-next", (event, message) => {
  const { queue, player, trackHistory } = Root.stores;
  const PE = document.querySelector("#embedded-player") as any;
  const prevTrack = player.currentTrack;
  const track = queue.nextTrack();

  if (!track) {
    if (player.repeat === Repeat.ALL && player.isShuffling) {
      queue.addTracks(player.currentPlaylist.tracks);
      queue.shuffel();
      player.playTrack(queue.tracks[0]);
      PE.contentWindow.postMessage(
        {
          type: "playTrack",
          track: getSnapshot(queue.tracks[0])
        },
        "https://player.aye-player.de"
      );
    } else if (player.repeat === Repeat.ALL) {
      queue.addTracks(player.currentPlaylist.tracks);
      player.playTrack(player.currentPlaylist.tracks[0]);
      PE.contentWindow.postMessage(
        {
          type: "playTrack",
          track: getSnapshot(player.currentPlaylist.tracks[0])
        },
        "https://player.aye-player.de"
      );
    } else {
      player.togglePlayingState();
      PE.contentWindow.postMessage(
        {
          type: "togglePlayingState"
        },
        "https://player.aye-player.de"
      );
    }
    return;
  }

  trackHistory.addTrack(prevTrack.id);
  player.playTrack(track);
  PE.contentWindow.postMessage(
    {
      type: "playTrack",
      track: getSnapshot(track)
    },
    "https://player.aye-player.de"
  );
});

ipcRenderer.on("play-previous", (event, message) => {
  const { player, queue, trackHistory } = Root.stores;
  const PE = document.querySelector("#embedded-player") as any;
  const track = trackHistory.removeAndGetTrack();
  if (!track) return;

  queue.addPrivilegedTrack(player.currentTrack);

  player.playTrack(track);
  PE.contentWindow.postMessage(
    {
      type: "playTrack",
      track: getSnapshot(track)
    },
    "https://player.aye-player.de"
  );
});

ipcRenderer.on("position", (event, message) => {
  const PE = document.querySelector("#embedded-player") as any;
  PE.seekTo(Math.floor(message.pos));
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
  playerElement = document.querySelector("#embedded-player") as any;

  window.onmessage = (m: any) => {
    if (m.origin === "https://player.aye-player.de") {
      if (m.data.type === "setPlaybackPosition") {
        player.setPlaybackPosition(m.data.playbackPosition);
      } else if (m.data.type === "playNextTrack") {
        _playNextTrack();
      }
    }
  };

  const _playVideo = () => {
    playerElement.contentWindow.postMessage(
      {
        type: "setTrack",
        track: getSnapshot(player.currentTrack)
      },
      "https://player.aye-player.de"
    );
    playerElement.contentWindow.postMessage(
      {
        type: "togglePlayingState"
      },
      "https://player.aye-player.de"
    );
    player.togglePlayingState();
  };

  const _stopVideo = () => {
    playerElement.contentWindow.postMessage(
      {
        type: "togglePlayingState"
      },
      "https://player.aye-player.de"
    );
    player.togglePlayingState();
  };

  const _pauseVideo = () => {
    playerElement.contentWindow.postMessage(
      {
        type: "togglePlayingState"
      },
      "https://player.aye-player.de"
    );
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
        playerElement.contentWindow.postMessage(
          {
            type: "setTrack",
            track: queue.tracks[0]
          },
          "https://player.aye-player.de"
        );
      } else if (player.repeat === Repeat.ALL) {
        queue.addTracks(player.currentPlaylist.tracks);
        player.playTrack(player.currentPlaylist.tracks[0]);
        playerElement.contentWindow.postMessage(
          {
            type: "setTrack",
            track: player.currentPlaylist.tracks[0]
          },
          "https://player.aye-player.de"
        );
      } else {
        player.togglePlayingState();
        player.setCurrentTrack();
        playerElement.contentWindow.postMessage(
          {
            type: "togglePlayingState"
          },
          "https://player.aye-player.de"
        );
      }
      return;
    }

    trackHistory.addTrack(prevTrack.id);

    player.setCurrentTrack();
    playerElement.contentWindow.postMessage(
      {
        type: "setTrack",
        track: ""
      },
      "https://player.aye-player.de"
    );
    player.playTrack(track);
    playerElement.contentWindow.postMessage(
      {
        type: "setTrack",
        track
      },
      "https://player.aye-player.de"
    );
  };

  const _toggleRepeat = () => {
    if (player.repeat === Repeat.ONE) {
      player.setRepeat(Repeat.NONE);
      playerElement.contentWindow.postMessage(
        {
          type: "setLooping",
          state: false
        },
        "https://player.aye-player.de"
      );
    } else if (player.repeat === Repeat.ALL) {
      player.setRepeat(Repeat.ONE);
      playerElement.contentWindow.postMessage(
        {
          type: "setLooping",
          state: true
        },
        "https://player.aye-player.de"
      );
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
    playerElement.contentWindow.postMessage(
      {
        type: "setTrack",
        track
      },
      "https://player.aye-player.de"
    );
  };

  const _handleSeekMouseUp = (value: number) => {
    playerElement.contentWindow.postMessage(
      {
        type: "seek",
        time: value
      },
      "https://player.aye-player.de"
    );
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
