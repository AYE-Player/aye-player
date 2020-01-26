import { Grid } from "@material-ui/core";
import { ipcRenderer } from "electron";
import { getSnapshot } from "mobx-keystone";
import { SnackbarProvider } from "notistack";
import React, { Component } from "react";
import { HashRouter } from "react-router-dom";
import styled from "styled-components";
import Player from "../components/Player/Player";
import QueuePlaylistSwitch from "../components/QueuePlaylistSwitch";
import { StoreProvider } from "../components/StoreProvider";
import ApiClient from "../dataLayer/api/ApiClient";
import PlayerInterop from "../dataLayer/api/PlayerInterop";
import Playlist from "../dataLayer/models/Playlist";
import Track from "../dataLayer/models/Track";
import Settings from "../dataLayer/stores/PersistentSettings";
import createStore from "../dataLayer/stores/createStore";
import AyeLogger from "../modules/AyeLogger";
import { LogType, Repeat } from "../types/enums";
import MainPage from "./MainPage";
import { AyeRemote } from "@aye/aye-remote";
import os from "os";

interface IPlayerSettings {
  volume: number;
  playbackPosition: number;
  repeat: Repeat;
  isMuted: boolean;
  isShuffling: boolean;
  currentTrack: Track;
  currentPlaylist: {
    id: string;
    trackCount: number;
    duration: number;
  };
}

const rootStore = createStore();

const remote = new AyeRemote("http://localhost:8337", "12345", os.hostname());

remote.socket.on("play", () => {
  rootStore.player.togglePlayingState();
  PlayerInterop.togglePlayingState();
});

ipcRenderer.on("app-close", (event, message) => {
  Settings.set("playerSettings.volume", rootStore.player.volume);
  Settings.set(
    "playerSettings.playbackPosition",
    rootStore.player.playbackPosition
  );
  Settings.set("playerSettings.repeat", rootStore.player.repeat);
  Settings.set("playerSettings.isMuted", rootStore.player.isMuted);
  Settings.set("playerSettings.isShuffling", rootStore.player.isShuffling);

  if (rootStore.player.currentPlaylist) {
    Settings.set("playerSettings.currentPlaylist", {
      id: rootStore.player.currentPlaylist.id,
      trackCount: rootStore.player.currentPlaylist.current.trackCount,
      duration: rootStore.player.currentPlaylist.current.duration
    });
  }
  if (
    rootStore.player.currentTrack?.id !==
    Settings.get("playerSettings.currentTrack").id
  ) {
    Settings.set(
      "playerSettings.currentTrack",
      getSnapshot(rootStore.player.currentTrack.current)
    );
  }
});

const MainGrid = styled.div`
  height: 100%;
  width: calc(100% - 330px);
  flex-direction: row;
`;

const getPlaylists = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const playlists = await ApiClient.getPlaylists();

      for (const playlist of playlists) {
        const pl = new Playlist({
          id: playlist.Id,
          name: playlist.Name,
          duration: playlist.Duration,
          trackCount: playlist.SongsCount,
          tracks: []
        });

        rootStore.playlists.add(pl);
      }
    }
  } catch (error) {
    AyeLogger.player(
      `[Root] Error retrieving Playlists ${error}`,
      LogType.ERROR
    );
  }
};

export default class Root extends Component {
  public static stores = rootStore;

  /**
   *  Fill stores with cached information and sync with server (maybe do this in afterCreate?)
   */
  constructor(props: any) {
    super(props);
    try {
      getPlaylists().then(() => {
        if (Settings.has("playerSettings")) {
          const playerSettings: IPlayerSettings = Settings.get(
            "playerSettings"
          );

          // Check for playbackPosition
          if (
            playerSettings.playbackPosition &&
            !playerSettings.currentTrack?.isLivestream
          ) {
            rootStore.player.setPlaybackPosition(
              playerSettings.playbackPosition
            );
            PlayerInterop.setStartTime(playerSettings.playbackPosition);
          }

          // Check for currentTrack and if it was a liveStream or not
          if (playerSettings.currentTrack?.isLivestream === false) {
            const currentTrack = new Track(playerSettings.currentTrack);
            if (
              !rootStore.trackCache.tracks.find(
                t => t.id === playerSettings.currentTrack.id
              )
            ) {
              rootStore.trackCache.add(currentTrack);
            }
            rootStore.queue.addTrack(currentTrack);
            rootStore.player.setCurrentTrack(currentTrack);
            rootStore.player.notifyRPC({ state: "Paused" });
            PlayerInterop.setInitValues({ track: currentTrack });
          }

          // Check for last active playlist
          if (playerSettings.currentPlaylist) {
            const playlist = rootStore.playlists.getListById(
              playerSettings.currentPlaylist.id
            );
            if (!playlist) return;
            try {
              ApiClient.getTracksFromPlaylist(
                playlist.id,
                playlist.trackCount
              ).then(tracks => {
                for (const track of tracks) {
                  const tr = new Track({
                    id: track.Id,
                    duration: track.Duration,
                    title: track.Title
                  });
                  if (!rootStore.trackCache.tracks.find(t => t.id === tr.id)) {
                    rootStore.trackCache.add(tr);
                  }
                  playlist.addLoadedTrack(tr);
                }
                rootStore.player.setCurrentPlaylist(playlist);
              });
            } catch (error) {
              AyeLogger.player(
                `[Root] Error retrieving Playlist songs ${error}`,
                LogType.ERROR
              );
            }
          }

          // TODO: Remove these checks, whenever the electron-store package fixes it,
          // these should have an default setting, but sometimes the defaults are not saved/returned
          if (playerSettings.repeat) {
            rootStore.player.setRepeat(playerSettings.repeat);
            if (playerSettings.repeat === Repeat.ONE) {
              PlayerInterop.setLooping(true);
            }
          }
          if (playerSettings.volume) {
            rootStore.player.setVolume(playerSettings.volume);
            PlayerInterop.setInitValues({ volume: playerSettings.volume });
          }
          if (playerSettings.isShuffling) {
            rootStore.player.setShuffling(playerSettings.isShuffling);
          }
          if (playerSettings.isMuted) {
            rootStore.player.setMute(playerSettings.isMuted);
            PlayerInterop.setInitValues({ isMuted: playerSettings.isMuted });
          }
          PlayerInterop.setInitState();
        }
      });
    } catch (error) {
      AyeLogger.player(`Error loading settings ${error}`, LogType.ERROR);
    }
  }

  render() {
    return (
      <StoreProvider value={rootStore}>
        <SnackbarProvider
          anchorOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
        >
          <Grid
            container
            direction="row"
            data-tid="container"
            style={{ height: "100%", padding: "8px 8px 0 8px" }}
          >
            <div
              style={{
                height: "100%",
                borderRight: "1px solid #565f6c",
                width: "328px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <QueuePlaylistSwitch />
              <Player />
            </div>
            <MainGrid>
              <HashRouter>
                <MainPage />
              </HashRouter>
            </MainGrid>
          </Grid>
        </SnackbarProvider>
      </StoreProvider>
    );
  }
}
