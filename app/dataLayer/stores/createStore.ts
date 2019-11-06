import User from "../models/User";
import AppStore from "./AppStore";
import Settings from "./PersistentSettings";
import Player from "./Player";
import Playlists from "./Playlists";
import Queue from "./Queue";
import RootStore, { RootStoreEnv, RootStoreModel } from "./RootStore";
import TrackStore from "./Tracks";
import TrackHistory from "./TrackHistory";

export const createStore = (): RootStoreModel => {
  const playlists = Playlists.create();
  const player = Player.create();
  const queue = Queue.create();
  const user = User.create();
  const app = AppStore.create({
    rpcEnabled: Settings.get("rpcEnabled"),
    minimizeToTray: Settings.get("minimizeToTray"),
    language: Settings.get("language")
  });
  const tracks = TrackStore.create();
  const trackHistory = TrackHistory.create();

  const env: RootStoreEnv = {
    player: player,
    playlists: playlists,
    queue: queue,
    user: user,
    app: app,
    tracks: tracks,
    trackHistory
  };

  const rootStore = RootStore.create(
    {
      player,
      playlists,
      queue,
      user,
      app,
      tracks,
      trackHistory
    },
    env
  );

  return rootStore;
};
