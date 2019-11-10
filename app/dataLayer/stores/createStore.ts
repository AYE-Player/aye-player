import User from "../models/User";
import AppStore from "./AppStore";
import Settings from "./PersistentSettings";
import Player from "./Player";
import Playlists from "./Playlists";
import Queue from "./Queue";
import RootStore, { RootStoreEnv, RootStoreModel } from "./RootStore";
import TrackStore from "./Tracks";
import TrackHistory from "./TrackHistory";
import SearchResult from "./SearchResult";

export const createStore = (): RootStoreModel => {
  const playlists = Playlists.create();
  const player = Player.create({
    volume: 0.2,
    repeat: "none",
    isShuffling: false,
    isReady: false,
    isPlaying: false,
    isMuted: false,
    isSeeking: false,
    playbackPosition: 0
  });
  const queue = Queue.create();
  const user = User.create();
  const app = AppStore.create({
    rpcEnabled: Settings.get("rpcEnabled"),
    minimizeToTray: Settings.get("minimizeToTray"),
    language: Settings.get("language")
  });
  const tracks = TrackStore.create();
  const trackHistory = TrackHistory.create();
  const searchResult = SearchResult.create();

  const env: RootStoreEnv = {
    player,
    playlists,
    queue,
    user,
    app,
    tracks,
    trackHistory,
    searchResult
  };

  const rootStore = RootStore.create(
    {
      player,
      playlists,
      queue,
      user,
      app,
      tracks,
      trackHistory,
      searchResult
    },
    env
  );

  return rootStore;
};
