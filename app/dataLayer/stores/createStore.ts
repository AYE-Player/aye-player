import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Queue from "./Queue";
import User from "../models/User";
import AppStore from "./AppStore";
import Playlists from "./Playlists";
import Playlist from "../models/Playlist";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const playlist = Playlist.create({
    id: "PL_1"
  });
  const playlists = Playlists.create();
  const player = Player.create();
  const queue = Queue.create();
  const user = User.create({
    id: "USER_1"
  });
  const app = AppStore.create();

  const env: RootStoreEnv = {
    player: player,
    playlist: playlist,
    playlists: playlists,
    queue: queue,
    user: user,
    app: app
  };

  const rootStore = RootStore.create(
    {
      player,
      playlist,
      playlists,
      queue,
      user,
      app
    },
    env
  );

  return rootStore;
};
