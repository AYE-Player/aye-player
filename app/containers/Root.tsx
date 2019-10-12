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
    id: "K6FjvOTkxKY",
    title: "Long ass Nightcore comp",
    duration: 2222222,
  })
);
rootStore.playlist.addTrack(
  Track.create({
    id: "Ee-iDzc9vc0",
    title: "In Your Head",
    duration: 1234,
  })
);
rootStore.playlist.addTrack(
  Track.create({
    id: "xkIytYlDD_o",
    title: "Dollhouse",
    duration: 165
  })
);

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
