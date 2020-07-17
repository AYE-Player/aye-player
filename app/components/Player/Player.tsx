import { ipcRenderer } from "electron";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import Root from "../../containers/Root";
import ApiClient from "../../dataLayer/api/ApiClient";
import ListenMoeWebsocket from "../../dataLayer/api/ListenMoeWebsocket";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import AyeLogger from "../../modules/AyeLogger";
import { IncomingMessageType, LogType, Repeat } from "../../types/enums";
import { IListenMoeSongUpdate } from "../../types/response";
import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PlayerControlsContainer from "./PlayerControlsContainer";
import ListenMoeApiClient from "../../dataLayer/api/ListenMoeApiClient";
const AyeLogo = require("../../images/aye_temp_logo.png");
const ListenMoe = require("../../images/listenmoe.svg");

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
    queue.addTracks(
      player.currentPlaylist.current.tracks.map((track) => track.current)
    );
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
      queue.addTracks(
        player.currentPlaylist.current.tracks.map((track) => track.current)
      );
      queue.shuffel();
      player.playTrack(queue.currentTrack.current);
      PlayerInterop.playTrack(queue.currentTrack.current);
    } else if (player.repeat === Repeat.ALL) {
      queue.addTracks(
        player.currentPlaylist.current.tracks.map((track) => track.current)
      );
      player.playTrack(player.currentPlaylist.current.tracks[0].current);
      PlayerInterop.playTrack(player.currentPlaylist.current.tracks[0].current);
    } else {
      player.togglePlayingState();
      PlayerInterop.togglePlayingState();
    }
    return;
  }

  if (player.currentTrack) {
    trackHistory.addTrack(prevTrack.current);
  }
  player.playTrack(track.current);
  PlayerInterop.playTrack(track.current);
});

ipcRenderer.on("play-song", async (event, message) => {
  try {
    const {
      queue,
      player,
      trackHistory,
      trackCache,
      searchResult,
    } = Root.stores;
    const prevTrack = player.currentTrack;

    const trackInfo = await searchResult.getTrackFromUrl(
      `https://www.youtube.com/watch?v=${message.id}`
    );

    let track: Track;
    if (!trackCache.getTrackById(trackInfo.id)) {
      track = new Track({
        id: trackInfo.id,
        duration: trackInfo.duration,
        title: trackInfo.title,
      });
      trackCache.add(track);
    } else {
      track = trackCache.getTrackById(trackInfo.id);
    }

    if (player.currentTrack) {
      trackHistory.addTrack(prevTrack.current);
    }
    queue.addPrivilegedTrack(track);
    player.playTrack(track);
    PlayerInterop.playTrack(track);
  } catch (error) {
    AyeLogger.player(
      `Error playing track ${JSON.stringify(error, null, 2)}`,
      LogType.ERROR
    );
  }
});

ipcRenderer.on("play-previous", (event, message) => {
  const { player, queue, trackHistory } = Root.stores;
  const track = trackHistory.removeAndGetTrack();
  if (!track) return;

  queue.addPrivilegedTrack(player.currentTrack.current);

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
    trackHistory,
    app,
    trackCache,
  }: RootStore) => ({
    player,
    queue,
    playlists,
    trackHistory,
    app,
    trackCache,
  });

  const { player, queue, trackHistory, app, trackCache } = useInject(Store);
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
          if (data.playbackPosition < oldPosition && player.currentTrack) {
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

  // Handle listenmoe websocket song updates
  if (player.websocketConnected) {
    ListenMoeWebsocket.ws.onmessage = async (message) => {
      if (!message.data.length) return;
      let response: IListenMoeSongUpdate;
      try {
        response = JSON.parse(message.data);
      } catch (error) {
        return;
      }
      switch (response.op) {
        case 0:
          ListenMoeWebsocket.ws.send(JSON.stringify({ op: 9 }));
          ListenMoeWebsocket.sendHeartbeat(response.d.heartbeat);
          break;
        case 1:
          if (
            response.t !== "TRACK_UPDATE" &&
            response.t !== "TRACK_UPDATE_REQUEST" &&
            response.t !== "QUEUE_UPDATE" &&
            response.t !== "NOTIFICATION"
          )
            break;

          ipcRenderer.send("setDiscordActivity", {
            startTimestamp: response.d.startTime,
            details: `${response.d.song.artists[0]?.name ?? "<no artist>"} - ${
              response.d.song.title ?? "<no title>"
            } (Listen.moe)`,
            state: null,
            duration: response.d.song.duration,
          });

          let favorite = [];
          if (app.listenMoeLoggedIn) {
            favorite = await ListenMoeApiClient.checkFavorite([
              response.d.song.id,
            ]).catch((err) => {
              console.error("Error checking for favorit entry", err);
              return [];
            });
          }

          player.setListeMoeData({
            id: response.d.song.id,
            artists:
              response.d.song.artists
                ?.map((artist) => artist.name)
                .toString() ?? "<no artist>",
            title: response.d.song.title ?? "<no title>",
            duration: response.d.song.duration ?? 0,
            favorite: favorite.includes(response.d.song.id),
          });
          break;
        default:
          break;
      }
    };

    // listen for errors / disconnects
    ListenMoeWebsocket.ws.onclose = (error) => {
      console.log(
        "%c> [ListenMoe] Websocket connection closed.",
        "color: #ff015b;",
        error
      );
      clearInterval(ListenMoeWebsocket.heartbeatInterval);
      ListenMoeWebsocket.heartbeatInterval = null;
      if (ListenMoeWebsocket.ws) {
        ListenMoeWebsocket.ws.close();
        ListenMoeWebsocket.ws = null;
      }
      if (!error.wasClean) {
        console.log("%c> [ListenMoe] Reconnecting...", "color: #008000;");
        setTimeout(() => {
          player.setLivestreamSource("listen.moe");
        }, 5000);
        player.setWebsocketConnected(false);
        player.setListeMoeData(undefined);
      }
    };
  }

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

  const _getNextRadioTracks = async (prevTrack?: Track) => {
    const relatedTracks = await ApiClient.getRelatedTracks(
      player.currentTrack?.current.id || prevTrack.id
    );
    const tracks: Track[] = [];
    for (const trk of relatedTracks) {
      let track: Track;
      if (!trackCache.getTrackById(trk.Id)) {
        track = new Track({
          id: trk.Id,
          title: trk.Title,
          duration: trk.Duration,
        });
        trackCache.add(track);
      } else {
        track = trackCache.getTrackById(trk.Id);
      }
      tracks.push(track);
    }
    queue.addTracks(tracks);
  };

  const _playNextTrack = async () => {
    const prevTrackRef = player.currentTrack;
    const prevTrack = prevTrackRef.current;
    const track = queue.nextTrack();

    if (!track) {
      const idx = player.currentPlaylist.current.getIndexOfTrack(prevTrackRef);

      if (idx !== -1 && idx !== player.currentPlaylist.current.trackCount - 1) {
        queue.addTracks(
          player.currentPlaylist.current
            .getTracksStartingFrom(idx + 1)
            .map((track) => track.current)
        );
        player.playTrack(queue.currentTrack.current);
        PlayerInterop.playTrack(queue.currentTrack.current);
      } else if (player.repeat === Repeat.ALL && player.isShuffling) {
        queue.addTracks(
          player.currentPlaylist.current.tracks.map((track) => track.current)
        );
        queue.shuffel();
        player.playTrack(queue.currentTrack.current);
        PlayerInterop.setTrack(queue.currentTrack.current);
      } else if (player.repeat === Repeat.ALL) {
        queue.addTracks(
          player.currentPlaylist.current.tracks.map((track) => track.current)
        );
        player.playTrack(player.currentPlaylist.current.tracks[0].current);
        PlayerInterop.setTrack(
          player.currentPlaylist.current.tracks[0].current
        );
      } else if (app.autoRadio) {
        await _getNextRadioTracks(prevTrack);

        trackHistory.addTrack(prevTrack);

        player.setCurrentTrack();
        player.playTrack(queue.currentTrack.current);
        PlayerInterop.playTrack(queue.currentTrack.current);
      } else {
        player.togglePlayingState();
        PlayerInterop.togglePlayingState();
        player.setCurrentTrack();
        PlayerInterop.setTrack();
        player.notifyRPC({ state: "Idle" });
      }
    } else {
      if (queue.tracks.length <= 3 && player.radioActive) {
        _getNextRadioTracks();
      }
      trackHistory.addTrack(prevTrack);

      player.setCurrentTrack();
      player.playTrack(track.current);
      PlayerInterop.playTrack(track.current);
    }
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
      queue.addTracks(
        player.currentPlaylist.current.tracks.map((track) => track.current)
      );
      queue.shuffel();
    } else {
      const idx = player.currentPlaylist.current.getIndexOfTrack(
        player.currentTrack
      );

      queue.clear();
      queue.addTracks(
        player.currentPlaylist.current
          .getTracksStartingFrom(idx)
          .map((track) => track.current)
      );
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

  const _favoriteSong = () => {
    player.favoriteSong();
  };

  const _deFavoriteSong = () => {
    player.deFavoriteSong();
  };

  return (
    <Container>
      <PlayerControlsContainer
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
            backgroundColor: "#161618",
            zIndex: 999,
          }}
        />
      ) : null}
      {player.livestreamSource === "listen.moe" ? (
        <>
          <img
            src={ListenMoe}
            style={{
              width: "320px",
              height: "200px",
              position: "absolute",
              marginTop: "35px",
              borderColor: "none",
              backgroundColor: "#161618",
              zIndex: 999,
            }}
          />
          {player.listenMoeTrackData && (
            <div
              style={{
                zIndex: 1000,
                position: "absolute",
                bottom: "8px",
                width: "264px",
                height: "48px",
              }}
            >
              {player.listenMoeTrackData.title}{" "}
              {player.listenMoeTrackData.artists
                ? `- ${player.listenMoeTrackData.artists}`
                : ""}
            </div>
          )}
          {app.listenMoeLoggedIn ? (
            player.listenMoeTrackData && player.listenMoeTrackData.favorite ? (
              <FavoriteIcon
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  bottom: "-28px",
                  right: "5px",
                }}
                onClick={() => _deFavoriteSong()}
              />
            ) : (
              <FavoriteBorderOutlinedIcon
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  bottom: "-28px",
                  right: "5px",
                }}
                onClick={() => _favoriteSong()}
              />
            )
          ) : null}
        </>
      ) : null}
      <div
        style={{
          width: "320px",
          height: "215px",
          overflow: "hidden",
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
              border: "none",
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
              border: "none",
            }}
          />
        )}
      </div>
    </Container>
  );
};

export default observer(Player);
