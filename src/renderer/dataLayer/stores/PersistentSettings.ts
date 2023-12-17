import Store from 'electron-store';

type StoreType = {
  rpcEnabled: boolean;
  minimizeToTray: boolean;
  showNotifications: boolean;
  devMode: boolean;
  autoRadio: boolean;
  language: string;
  playerSettings: {
    volumne: number;
    playbackPosition: number;
    currentTrack?: object;
    currentPlaylist?: object;
    repeat: number;
    isShuffling: boolean;
    isMuted: boolean;
  };
  windowSize?: {
    width: number;
    height: number;
  }
  windowPosition?: {
    x: number;
    y: number;
  }
};

const store = new Store<StoreType>({
  defaults: {
    rpcEnabled: true,
    autoRadio: false,
    minimizeToTray: false,
    showNotifications: true,
    devMode: false,
    language: 'en',
    playerSettings: {
      volumne: 0.2,
      repeat: 0,
      isMuted: false,
      isShuffling: false,
      playbackPosition: 0
    },
  },
});

export default store;
