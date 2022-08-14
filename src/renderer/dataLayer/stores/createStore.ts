import { Repeat } from '../../../types/enums';
import Player from '../models/Player';
import User from '../models/User';
import AppStore from './AppStore';
import Playlists from './Playlists';
import Queue from './Queue';
import RootStore from './RootStore';
import SearchResult from './SearchResult';
import TrackCache from './TrackCache';
import TrackHistory from './TrackHistory';

const createStore = (): RootStore => {
  const rootStore = new RootStore({
    app: new AppStore({
      showQueue: false,
      rpcEnabled: window.electron.settings.get('rpcEnabled'),
      minimizeToTray: window.electron.settings.get('minimizeToTray'),
      language: window.electron.settings.get('language'),
      devMode: window.electron.settings.get('devMode'),
      autoRadio: window.electron.settings.get('autoRadio'),
      showNotifications: window.electron.settings.get('showNotifications'),
      selectedPlaylist: '',
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
      currentPlaylist: undefined,
      externalPlayerVersion: '',
      radioActive: false,
      listenMoeTrackData: undefined,
      livestreamSource: undefined,
      websocketConnected: undefined,
    }),
    playlists: new Playlists({
      lists: [],
    }),
    queue: new Queue({
      tracks: [],
    }),
    trackCache: new TrackCache({
      tracks: [],
    }),
    trackHistory: new TrackHistory({
      tracks: [],
    }),
    searchResult: new SearchResult({
      tracks: [],
    }),
    user: new User({}),
  });

  return rootStore;
};

export default createStore;
