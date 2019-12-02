import { Grid } from "@material-ui/core";
import axios from "axios";
import { ipcRenderer } from "electron";
import { getSnapshot } from "mobx-state-tree";
import { SnackbarProvider } from "notistack";
import React, { Component } from "react";
import { HashRouter } from "react-router-dom";
import Player from "../components/Player/Player";
import QueuePlaylistSwitch from "../components/QueuePlaylistSwitch";
import { StoreProvider } from "../components/StoreProvider";
import Playlist, { PlaylistModel } from "../dataLayer/models/Playlist";
import Track, { TrackModel } from "../dataLayer/models/Track";
import { createStore } from "../dataLayer/stores/createStore";
import Settings from "../dataLayer/stores/PersistentSettings";
import AyeLogger from "../modules/AyeLogger";
import { LogType, Repeat } from "../types/enums";
import MainPage from "./MainPage";

interface IPlayerSettings {
  volume: number;
  playbackPosition: number;
  repeat: Repeat;
  isMuted: boolean;
  isShuffling: boolean;
  currentTrack: TrackModel;
  currentPlaylist: PlaylistModel;
}

const rootStore = createStore();

/*if (process.env.NODE_ENV === "development") {
  rootStore.playlists.add(
    Playlist.create({
      id: "1",
      name: "Awesome Playlist",
      tracks: []
    })
  );
  rootStore.playlists.add(
    Playlist.create({
      id: "2",
      name: "test",
      tracks: []
    })
  );
  const playlist = rootStore.playlists.getListById("1");
  let track = Track.create({
    id: "A0HDitIHMXo",
    title: "Nightcore - MAYDAY",
    duration: 215
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "_8mwWhyjOS0",
    title: "Neovaii - Feel Better",
    duration: 235
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "BLBiLjQl4uQ",
    title: "Neovaii - Bad For You",
    duration: 262
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "j2QXZD5tk8c",
    title: "Neovaii - Take It Back",
    duration: 214
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "Rz5BHmd4XkE",
    title: "Neovaii - Don't You Know",
    duration: 225
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "E3wJFVmyeT4",
    title: "Neovaii - I Remember",
    duration: 192
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "nzhAgfs_Gv4",
    title: "Neovaii - At The End",
    duration: 218
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "mWrrBndTadM",
    title: "Neovaii - Just Be Me",
    duration: 195
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "g6xFyd3CMXQ",
    title: "Neovaii - Let Me Go",
    duration: 198
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "dQmjxCJFyQA",
    title: "Neovaii - Should've Started",
    duration: 225
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "lJ_TSjn-khU",
    title: "Neovaii - Chase Pop",
    duration: 200
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "ijKrFbLXkj8",
    title: "Neovaii - Crash",
    duration: 226
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "7bD_r5u3znQ",
    title: "Neovaii - Your Eyes",
    duration: 212
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "VSdgdjMnw1k",
    title: "Neovaii - Feel You",
    duration: 203
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "mXah1eQBUFs",
    title: "Neovaii - Serenity",
    duration: 197
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "UWzRZ0LgiWc",
    title: "Neovaii - Heart Shaped Box",
    duration: 291
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "4Q46xYqUwZQ",
    title: "Legends Never Die",
    duration: 235
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "UOxkGD8qRB4",
    title: "POP/STARS",
    duration: 202
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  track = Track.create({
    id: "RG_DLoKkGsg",
    title: "Phoenix",
    duration: 175
  });
  rootStore.trackCache.add(track);
  playlist.addLoadedTrack(track);

  const playlist2 = rootStore.playlists.getListById("2");

  track = Track.create({
    id: "63i0u26PlpI",
    title: "Nightcore - Cradles (Besomorph)",
    duration: 122
  });
  rootStore.trackCache.add(track);
  playlist2.addLoadedTrack(track);

  track = Track.create({
    id: "Pre8O2RlbjU",
    title: "Nightcore - Play (Alan Walker, K-391)",
    duration: 148
  });
  rootStore.trackCache.add(track);
  playlist2.addLoadedTrack(track);

  // rootStore.queue.addTracks(rootStore.playlists.lists[0].tracks);
  rootStore.player.setCurrentPlaylist(rootStore.playlists.lists[0]);
  //rootStore.player.setCurrentTrack(rootStore.playlists.lists[0].tracks[0]);
}*/

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
    Settings.set(
      "playerSettings.currentPlaylist.id",
      rootStore.player.currentPlaylist.id
    );
  }
  if (
    rootStore.player.currentTrack &&
    rootStore.player.currentTrack.id !==
      Settings.get("playerSettings.currentTrack").id
  ) {
    Settings.set(
      "playerSettings.currentTrack",
      getSnapshot(rootStore.player.currentTrack)
    );
  }
});

const getPlaylists = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const { data: playlists } = await axios.get(
        "https://api.aye-player.de/playlists/v1",
        {
          headers: {
            "x-access-token": localStorage.getItem("token")
          }
        }
      );

      for (const playlist of playlists) {
        console.log("PL", playlist);
        const pl = Playlist.create({
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
    console.error(error);
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
      getPlaylists();

      if (Settings.has("playerSettings")) {
        const playerSettings: IPlayerSettings = Settings.get("playerSettings");

        // Check for currentTrack and if it was a liveStream or not
        if (playerSettings.currentTrack?.isLivestream === false) {
          const currentTrack = Track.create(playerSettings.currentTrack);
          if (
            !rootStore.trackCache.tracks.find(
              t => t.id === playerSettings.currentTrack.id
            )
          ) {
            rootStore.trackCache.add(currentTrack);
          }
          rootStore.queue.addTrack(currentTrack.id);
          rootStore.player.setCurrentTrack(currentTrack);
        }

        // Check for last active playlist
        if (playerSettings.currentPlaylist) {
          const playlist = rootStore.playlists.getListById(
            playerSettings.currentPlaylist.id
          );
          if (!playlist) return;
          rootStore.player.setCurrentPlaylist(playlist);
        }

        // Check for playbackPosition
        if (
          playerSettings.playbackPosition &&
          !playerSettings.currentTrack?.isLivestream
        ) {
          rootStore.player.setPlaybackPosition(playerSettings.playbackPosition);
          rootStore.player.setPlaying(true);
          setTimeout(() => rootStore.player.setPlaying(false), 500);
        }

        // TODO: Remove these checks, whenever the electron-store package fixes it,
        // these should have an default setting, but sometimes the defaults are not saved/returned
        if (playerSettings.repeat) {
          rootStore.player.setRepeat(playerSettings.repeat);
        }
        if (playerSettings.volume) {
          rootStore.player.setVolume(playerSettings.volume);
        }
        if (playerSettings.isShuffling) {
          rootStore.player.setShuffling(playerSettings.isShuffling);
        }
        if (playerSettings.isMuted) {
          rootStore.player.setMute(playerSettings.isMuted);
        }
      }
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
            <Grid container direction="row" style={{ height: "100%" }} xs={9}>
              <HashRouter>
                <MainPage />
              </HashRouter>
            </Grid>
          </Grid>
        </SnackbarProvider>
      </StoreProvider>
    );
  }
}
