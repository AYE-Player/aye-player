import Store from 'electron-store';
import { ModelData } from 'mobx-keystone';
import Track from '../models/Track';
import Playlist from '../models/Playlist';

type StoreType = {
  rpcEnabled: boolean;
  minimizeToTray: boolean;
  showNotifications: boolean;
  devMode: boolean;
  autoRadio: boolean;
  language: string;
  playerSettings: {
    volume: number;
    playbackPosition: number;
    currentTrack?: ModelData<Track>;
    currentPlaylist?: ModelData<Playlist>;
    repeat: number;
    isShuffling: boolean;
    isMuted: boolean;
  };
  windowSize?: {
    width: number;
    height: number;
  };
  windowPosition?: {
    x: number;
    y: number;
  };
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
      volume: 0.2,
      repeat: 0,
      isMuted: false,
      isShuffling: false,
      playbackPosition: 0,
    },
  },
});

export default store;
