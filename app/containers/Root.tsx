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
    id: "iqoNoU-rm14",
    title: "Cyberpunk",
    duration: 215,
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
    duration: 178,
  })
);
rootStore.playlist.addTrack(
  Track.create({
    id: "xkIytYlDD_o",
    title: "Dollhouse",
    duration: 123
  })
)

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
