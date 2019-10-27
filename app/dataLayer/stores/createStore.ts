import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Queue from "./Queue";
import User from "../models/User";
import AppStore from "./AppStore";
import Playlists from "./Playlists";
import TrackStore from "./Tracks";

export const createStore = (): RootStoreModel => {
  const playlists = Playlists.create();
  const player = Player.create();
  const queue = Queue.create();
  const user = User.create();
  const app = AppStore.create();
  const tracks = TrackStore.create();

  const env: RootStoreEnv = {
    player: player,
    playlists: playlists,
    queue: queue,
    user: user,
    app: app,
    tracks: tracks,
  };

  const rootStore = RootStore.create(
    {
      player,
      playlists,
      queue,
      user,
      app,
      tracks
    },
    env
  );

  return rootStore;
};
