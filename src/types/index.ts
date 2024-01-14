import { ModelData } from 'mobx-keystone';
import Track from 'renderer/dataLayer/models/Track';
import Playlist from 'renderer/dataLayer/models/Playlist';
import { Repeat } from './enums';

export interface IPlayerSettings {
  volume: number;
  playbackPosition: number;
  repeat: Repeat;
  isMuted: boolean;
  isShuffling: boolean;
  currentTrack: ModelData<Track>;
  currentPlaylist: ModelData<Playlist>;
}
