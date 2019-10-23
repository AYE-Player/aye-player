import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Playlist from "./Playlist";
import Queue from "./Queue";
import User from "../models/User";
import AppStore from "./AppStore";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const playlist = Playlist.create({
    id: "1"
  });
  const player = Player.create();
  const queue = Queue.create();
  const user = User.create();
  const app = AppStore.create({
    showQueue: false
  });

  const env: RootStoreEnv = {
    player: player,
    playlist: playlist,
    queue: queue,
    user: user,
    app: app
  };

  const rootStore = RootStore.create(
    {
      player,
      playlist,
      queue,
      user,
      app
    },
    env
  );

  return rootStore;
};
