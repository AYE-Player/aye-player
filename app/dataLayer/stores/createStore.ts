import User from "../models/User";
import AppStore from "./AppStore";
import Settings from "./PersistentSettings";
import Player from "./Player";
import Playlists from "./Playlists";
import Queue from "./Queue";
import RootStore, { RootStoreEnv, RootStoreModel } from "./RootStore";
import SearchResult from "./SearchResult";
import TrackHistory from "./TrackHistory";
import TrackStore from "./TrackCache";

export const createStore = (): RootStoreModel => {
  const playlists = Playlists.create({ lists: [] });
  const player = Player.create({
    volume: 0.2,
    repeat: "none",
    isShuffling: false,
    isReady: false,
    isPlaying: false,
    isMuted: false,
    isSeeking: false,
    playbackPosition: 0,
    currentTrack: undefined,
    currentPlaylist: undefined
  });
  const queue = Queue.create({ tracks: [] });
  const user = User.create();
  const app = AppStore.create({
    showQueue: false,
    rpcEnabled: Settings.get("rpcEnabled"),
    minimizeToTray: Settings.get("minimizeToTray"),
    language: Settings.get("language")
  });
  const trackCache = TrackStore.create({ tracks: [] });
  const trackHistory = TrackHistory.create({ tracks: [] });
  const searchResult = SearchResult.create({ tracks: [] });

  const env: RootStoreEnv = {
    player,
    playlists,
    queue,
    user,
    app,
    trackCache,
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
      trackCache,
      trackHistory,
      searchResult
    },
    env
  );

  return rootStore;
};
