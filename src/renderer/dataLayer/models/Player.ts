/* eslint-disable no-new */
import {
  getSnapshot,
  model,
  Model,
  modelAction,
  prop,
  Ref,
  getRoot,
} from 'mobx-keystone';
import { IDiscordActivity } from 'types/response';
import { Channel, Repeat } from '../../../types/enums';
import playlistRef from '../references/PlaylistRef';
import trackRef from '../references/TrackRef';
import Playlist from './Playlist';
import Track from './Track';
import RootStore from '../stores/RootStore';

interface IRPCState {
  track?: Track;
  state?: string;
}

@model('Player')
class Player extends Model({
  volume: prop<number>(),
  repeat: prop<Repeat>(),
  isShuffling: prop<boolean>(),
  isReady: prop<boolean>(),
  isPlaying: prop<boolean>(),
  isMuted: prop<boolean>(),
  isSeeking: prop<boolean>(),
  playbackPosition: prop<number>(),
  radioActive: prop<boolean>(),
  currentTrack: prop<Ref<Track> | undefined>(),
  currentPlaylist: prop<Ref<Playlist> | undefined>(),
  livestreamSource: prop<string | undefined>(),
  externalPlayerVersion: prop<string>(),
}) {
  @modelAction
  playTrack(track: Track) {
    const { app } = getRoot<RootStore>(this);

    this.playbackPosition = 0;
    window.electron.settings.set('playerSettings.playbackPosition', 0);

    this.currentTrack = trackRef(track);
    window.electron.settings.set(
      'playerSettings.currentTrack',
      getSnapshot(track),
    );

    this.livestreamSource = undefined;

    if (!this.isPlaying) this.isPlaying = true;

    if (app.showNotifications) {
      new Notification(`Now Playing: ${this.currentTrack.current.title}`, {
        icon: `https://img.youtube.com/vi/${this.currentTrack.current.id}/hqdefault.jpg`,
        silent: true,
      });
    }
    this.notifyRPC();
  }

  notifyRPC({ state }: IRPCState = {}) {
    if (state === 'Idle') {
      window.electron.ipcRenderer.sendMessage(Channel.SET_DISCORD_ACTIVITY, {
        details: 'Idle',
      });
      return;
    }

    if (this.currentTrack?.current.isLivestream) {
      window.electron.ipcRenderer.sendMessage(Channel.SET_DISCORD_ACTIVITY, {
        details:
          this.currentTrack.current.title.length >= 128
            ? `${this.currentTrack.current.title.substring(0, 123)}...`
            : this.currentTrack.current.title,
        state: state ?? null,
        trackId: this.currentTrack.id,
      });
    } else if (this.currentTrack) {
      window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
        type: 'isYoutube',
      });

      window.electron.ipcRenderer.sendMessage(Channel.SET_DISCORD_ACTIVITY, {
        playbackPosition: this.playbackPosition,
        endTimestamp: state ? null : this.currentTrack.current.duration,
        details:
          this.currentTrack.current.title.length >= 128
            ? `${this.currentTrack.current.title.substring(0, 123)}...`
            : this.currentTrack.current.title,
        state: state ?? null,
        duration: this.currentTrack.current.duration,
        trackId: this.currentTrack.id,
      } as IDiscordActivity);

      window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
        type: 'trackInfo',
        data: {
          id: this.currentTrack.current.id || 0,
          title: this.currentTrack.current.title,
          duration: this.currentTrack.current.duration || 0,
        },
      });
    }
  }

  @modelAction
  setRepeat(status: Repeat) {
    this.repeat = status;
    window.electron.settings.set('playerSettings.repeat', status);
  }

  @modelAction
  setVolume(vol: number) {
    this.volume = vol;
    window.electron.settings.set('playerSettings.volume', vol);
  }

  @modelAction
  setMute(state: boolean) {
    this.isMuted = state;
    window.electron.settings.set('playerSettings.isMuted', state);
  }

  @modelAction
  setShuffling(state: boolean) {
    this.isShuffling = state;
    window.electron.settings.set('playerSettings.isShuffling', state);
  }

  @modelAction
  setCurrentTrack(track?: Track) {
    if (track) {
      this.currentTrack = trackRef(track);
      window.electron.settings.set(
        'playerSettings.currentTrack',
        getSnapshot(track),
      );
    } else {
      this.currentTrack = undefined;
    }
  }

  @modelAction
  setCurrentPlaylist(playlist?: Playlist) {
    if (playlist) {
      this.currentPlaylist = playlistRef(playlist);
      window.electron.settings.set(
        'playerSettings.currentPlaylist.id',
        playlist.id,
      );
    } else {
      this.currentPlaylist = undefined;
    }
  }

  @modelAction
  setReadyState() {
    this.isReady = true;
  }

  @modelAction
  pause() {
    this.isPlaying = false;
  }

  @modelAction
  togglePlayingState() {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.notifyRPC();
    } else {
      this.notifyRPC({ state: 'Paused' });
    }

    window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
      type: 'onStateChange',
      data: this.isPlaying,
    });
  }

  @modelAction
  toggleShuffleState() {
    if (this.repeat === Repeat.ONE || this.repeat === Repeat.PLAYLIST) {
      this.repeat = Repeat.NONE;
    }

    this.isShuffling = !this.isShuffling;
    window.electron.settings.set(
      'playerSettings.isShuffling',
      this.isShuffling,
    );
  }

  @modelAction
  mute() {
    this.isMuted = true;
    window.electron.settings.set('playerSettings.isMuted', true);
  }

  @modelAction
  unmute() {
    this.isMuted = false;
    window.electron.settings.set('playerSettings.isMuted', false);
  }

  @modelAction
  setSeeking(state: boolean) {
    this.isSeeking = state;
  }

  @modelAction
  setPlaybackPosition(pos: number) {
    this.playbackPosition = pos;

    window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
      type: 'currentTime',
      data: this.playbackPosition,
    });
  }

  @modelAction
  setPlaying(state: boolean) {
    this.isPlaying = state;
  }

  @modelAction
  toggleRadioMode() {
    this.radioActive = !this.radioActive;
  }

  @modelAction
  setLivestreamSource(source: string) {
    this.currentTrack = undefined;
    this.livestreamSource = source;
  }

  @modelAction
  setExternalPlayerVersion(version: string) {
    this.externalPlayerVersion = version;
  }
}

export default Player;
