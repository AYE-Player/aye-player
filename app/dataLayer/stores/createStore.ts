import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Queue from "./Queue";
import User from "../models/User";
import AppStore from "./AppStore";
import Playlists from "./Playlists";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const playlists = Playlists.create();
  const player = Player.create();
  const queue = Queue.create();
  console.log("UUSER");
  const user = User.create();
  console.log("APPSTORE")
  const app = AppStore.create();

  const env: RootStoreEnv = {
    player: player,
    playlists: playlists,
    queue: queue,
    user: user,
    app: app
  };

  const rootStore = RootStore.create(
    {
      player,
      playlists,
      queue,
      user,
      app
    },
    env
  );

  return rootStore;
};
