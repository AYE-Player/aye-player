import React from "react";
import { Component } from "react";
import { HashRouter } from "react-router-dom";
import { StoreProvider } from "../components/StoreProvider";
import { createStore } from "../dataLayer/stores/createStore";
import Track from "../dataLayer/models/Track";
import { Grid } from "@material-ui/core";
import Player from "../components/Player/Player";
import Playlist from "../components/Playlist/Playlist";
import MainPage from "./MainPage";

const rootStore = createStore();

if (process.env.NODE_ENV === "development") {
  rootStore.playlist.addTrack(
    Track.create({
      id: "_8mwWhyjOS0",
      title: "Neovaii - Feel Better",
      duration: 235
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "BLBiLjQl4uQ",
      title: "Neovaii - Bad For You",
      duration: 262
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "j2QXZD5tk8c",
      title: "Neovaii - Take It Back",
      duration: 214
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "Rz5BHmd4XkE",
      title: "Neovaii - Don't You Know",
      duration: 225
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "E3wJFVmyeT4",
      title: "Neovaii - I Remember",
      duration: 192
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "nzhAgfs_Gv4",
      title: "Neovaii - At The End",
      duration: 117
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "mWrrBndTadM",
      title: "Neovaii - Just Be Me",
      duration: 195
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "g6xFyd3CMXQ",
      title: "Neovaii - Let Me Go",
      duration: 198
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "dQmjxCJFyQA",
      title: "Neovaii - Should've Started",
      duration: 225
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "lJ_TSjn-khU",
      title: "Neovaii - Chase Pop",
      duration: 200
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "ijKrFbLXkj8",
      title: "Neovaii - Crash",
      duration: 226
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "7bD_r5u3znQ",
      title: "Neovaii - Your Eyes",
      duration: 212
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "VSdgdjMnw1k",
      title: "Neovaii - Feel You",
      duration: 203
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "mXah1eQBUFs",
      title: "Neovaii - Serenity",
      duration: 197
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "UWzRZ0LgiWc",
      title: "Neovaii - Heart Shaped Box",
      duration: 291
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "4Q46xYqUwZQ",
      title: "Legends Never Die",
      duration: 235
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "UOxkGD8qRB4",
      title: "POP/STARS",
      duration: 202
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "RG_DLoKkGsg",
      title: "Phoenix",
      duration: 175
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "iqoNoU-rm14",
      title: "Cyberpunk",
      duration: 215
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "bzehQ60b3XI",
      title: "Close - Brooks Remix",
      duration: 231
    })
  );
  rootStore.playlist.addTrack(
    Track.create({
      id: "z_m0wtLMfdU",
      title: "Earthquake",
      duration: 178
    })
  );

  rootStore.queue.addTracks(rootStore.playlist.tracks);
  rootStore.player.setCurrentTrack(rootStore.playlist.tracks[0].id);
}

export default class Root extends Component {
  render() {
    return (
      <StoreProvider value={rootStore}>
        <Grid
          container
          direction="row"
          data-tid="container"
          style={{ height: "100%", padding: "8px 8px 0 8px" }}
        >
          <Grid container direction="column" style={{ height: "100%" }} xs={3}>
            <Playlist />
            <Player />
          </Grid>
          <Grid container direction="row" xs={9}>
            <HashRouter>
              <MainPage />
            </HashRouter>
          </Grid>
        </Grid>
      </StoreProvider>
    );
  }
}
