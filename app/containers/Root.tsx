import { Grid } from "@material-ui/core";
import { SnackbarProvider } from "notistack";
import React, { Component } from "react";
import { HashRouter } from "react-router-dom";
import Player from "../components/Player/Player";
import QueuePlaylistSwitch from "../components/QueuePlaylistSwitch";
import { StoreProvider } from "../components/StoreProvider";
import Playlist from "../dataLayer/models/Playlist";
import Track from "../dataLayer/models/Track";
import { createStore } from "../dataLayer/stores/createStore";
import MainPage from "./MainPage";

const rootStore = createStore();

if (process.env.NODE_ENV === "development") {
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
    id: "_8mwWhyjOS0",
    title: "Neovaii - Feel Better",
    duration: 235
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "BLBiLjQl4uQ",
    title: "Neovaii - Bad For You",
    duration: 262
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "j2QXZD5tk8c",
    title: "Neovaii - Take It Back",
    duration: 214
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "Rz5BHmd4XkE",
    title: "Neovaii - Don't You Know",
    duration: 225
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "E3wJFVmyeT4",
    title: "Neovaii - I Remember",
    duration: 192
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "nzhAgfs_Gv4",
    title: "Neovaii - At The End",
    duration: 117
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "mWrrBndTadM",
    title: "Neovaii - Just Be Me",
    duration: 195
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "g6xFyd3CMXQ",
    title: "Neovaii - Let Me Go",
    duration: 198
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "dQmjxCJFyQA",
    title: "Neovaii - Should've Started",
    duration: 225
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "lJ_TSjn-khU",
    title: "Neovaii - Chase Pop",
    duration: 200
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "ijKrFbLXkj8",
    title: "Neovaii - Crash",
    duration: 226
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "7bD_r5u3znQ",
    title: "Neovaii - Your Eyes",
    duration: 212
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "VSdgdjMnw1k",
    title: "Neovaii - Feel You",
    duration: 203
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "mXah1eQBUFs",
    title: "Neovaii - Serenity",
    duration: 197
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "UWzRZ0LgiWc",
    title: "Neovaii - Heart Shaped Box",
    duration: 291
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "4Q46xYqUwZQ",
    title: "Legends Never Die",
    duration: 235
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "UOxkGD8qRB4",
    title: "POP/STARS",
    duration: 202
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  track = Track.create({
    id: "RG_DLoKkGsg",
    title: "Phoenix",
    duration: 175
  });
  rootStore.trackCache.add(track);
  playlist.addTrack(track);

  const playlist2 = rootStore.playlists.getListById("2");

  track = Track.create({
    id: "63i0u26PlpI",
    title: "Nightcore - Cradles (Besomorph)",
    duration: 122
  });
  rootStore.trackCache.add(track);
  playlist2.addTrack(track);

  track = Track.create({
    id: "Pre8O2RlbjU",
    title: "Nightcore - Play (Alan Walker, K-391)",
    duration: 148
  });
  rootStore.trackCache.add(track);
  playlist2.addTrack(track);

  // rootStore.queue.addTracks(rootStore.playlists.lists[0].tracks);
  rootStore.player.setCurrentPlaylist(rootStore.playlists.lists[0]);
  //rootStore.player.setCurrentTrack(rootStore.playlists.lists[0].tracks[0]);
}

export default class Root extends Component {
  public static stores = rootStore;

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
