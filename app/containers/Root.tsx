import React from "react";
import { Component } from "react";
import { HashRouter } from "react-router-dom";
import Routes from "../Routes";
import { StoreProvider } from "../components/StoreProvider";
import { createStore } from "../../app/store/createStore";
import Track from "../../app/store/Track";

const rootStore = createStore();
rootStore.playlist.addTrack(
  Track.create({
    id: "j2QXZD5tk8c",
    title: "Neovaii - Take It Back",
    duration: 214
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
    id: "_8mwWhyjOS0",
    title: "Neovaii - Feel Better",
    duration: 259
  })
);
rootStore.playlist.addTrack(
  Track.create({
    id: "UWzRZ0LgiWc",
    title: "Neovaii - Heart Shaped Box",
    duration: 291
  })
)
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

export default class Root extends Component {
  render() {
    return (
      <StoreProvider value={rootStore}>
        <HashRouter>
          <Routes />
        </HashRouter>
      </StoreProvider>
    );
  }
}
