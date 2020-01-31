import Player from "../models/Player";
import User from "../models/User";
import Settings from "./PersistentSettings";
import AppStore from "./AppStore";
import RootStore from "./RootStore";
import TrackCache from "./TrackCache";
import { Repeat } from "../../types/enums";
import Playlists from "./Playlists";
import Queue from "./Queue";
import TrackHistory from "./TrackHistory";
import SearchResult from "./SearchResult";

const createStore = (): RootStore => {
  const rootStore = new RootStore({
    app: new AppStore({
      showQueue: false,
      rpcEnabled: Settings.get("rpcEnabled"),
      minimizeToTray: Settings.get("minimizeToTray"),
      language: Settings.get("language"),
      devMode: Settings.get("devMode"),
      autoRadio: Settings.get("autoRadio")
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
