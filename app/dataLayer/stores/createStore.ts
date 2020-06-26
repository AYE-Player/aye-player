import { Repeat } from "../../types/enums";
import Player from "../models/Player";
import User from "../models/User";
import AppStore from "./AppStore";
import Settings from "./PersistentSettings";
import Playlists from "./Playlists";
import Queue from "./Queue";
import RootStore from "./RootStore";
import SearchResult from "./SearchResult";
import TrackCache from "./TrackCache";
import TrackHistory from "./TrackHistory";

const createStore = (): RootStore => {
  const rootStore = new RootStore({
    app: new AppStore({
      showQueue: false,
      rpcEnabled: Settings.get("rpcEnabled"),
      minimizeToTray: Settings.get("minimizeToTray"),
      language: Settings.get("language"),
      devMode: Settings.get("devMode"),
      autoRadio: Settings.get("autoRadio"),
      showNotifications: Settings.get("showNotifications")
    }),
    player: new Player({
      volume: 0.2,
      repeat: Repeat.NONE,
      isShuffling: false,
      isReady: false,
      isPlaying: false,
      isMuted: false,
      isSeeking: false,
      playbackPosition: 0,
      currentTrack: undefined,
      currentPlaylist: undefined
    }),
    playlists: new Playlists({
      lists: []
    }),
    queue: new Queue({
      tracks: []
    }),
    trackCache: new TrackCache({
      tracks: []
    }),
    trackHistory: new TrackHistory({
      tracks: []
    }),
    searchResult: new SearchResult({
      tracks: []
    }),
    user: new User({})
  });

  return rootStore;
};

export default createStore;
