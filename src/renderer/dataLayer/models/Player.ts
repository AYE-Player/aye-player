/* eslint-disable no-new */
import {
  getSnapshot,
  model,
  Model,
  modelAction,
  prop,
  Ref,
  getRoot,
  modelFlow,
  _async,
  _await,
} from 'mobx-keystone';
import { Channel, Repeat } from '../../../types/enums';
import playlistRef from '../references/PlaylistRef';
import trackRef from '../references/TrackRef';
import Playlist from './Playlist';
import Track from './Track';
import ListenMoeWebsocket from '../api/ListenMoeWebsocket';
import RootStore from '../stores/RootStore';
import ListenMoeApiClient from '../api/ListenMoeApiClient';

interface IRPCState {
  track?: Track;
  state?: string;
}

interface IListenMoeTrackData {
  id: number;
  title: string;
  artists: string;
  duration: number;
  favorite: boolean;
  startTime: string;
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
  websocketConnected: prop(false),
  listenMoeTrackData: prop<IListenMoeTrackData | undefined>(),
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
      getSnapshot(track)
    );

    this.livestreamSource = undefined;
    if (this.websocketConnected) {
      ListenMoeWebsocket.disconnect();
      this.websocketConnected = false;
    }

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
      });
    } else if (this.currentTrack) {
      window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
        type: 'isYoutube',
      });

      window.electron.ipcRenderer.sendMessage(Channel.SET_DISCORD_ACTIVITY, {
        playbackPosition: this.playbackPosition,
        endTime: state ? null : this.currentTrack.current.duration,
        details:
          this.currentTrack.current.title.length >= 128
            ? `${this.currentTrack.current.title.substring(0, 123)}...`
            : this.currentTrack.current.title,
        state: state ?? null,
        duration: this.currentTrack.current.duration,
      });

      window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
        type: 'trackInfo',
        data: {
          id: this.currentTrack.current.id || 0,
          title: this.currentTrack.current.title,
          duration: this.currentTrack.current.duration || 0,
        },
      });
    } else if (this.listenMoeTrackData) {
      window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
        type: 'isRadio',
      });

      const details = `${this.listenMoeTrackData.artists} - ${this.listenMoeTrackData.title} (Listen.moe)`;

      window.electron.ipcRenderer.sendMessage(Channel.SET_DISCORD_ACTIVITY, {
        playbackPosition: this.playbackPosition,
        endTime: this.listenMoeTrackData.duration,
        startTimestamp: this.listenMoeTrackData.startTime,
        details:
          details.length >= 128 ? `${details.substring(0, 123)}...` : details,
        state: null,
        duration: this.listenMoeTrackData.duration,
      });

      window.electron.ipcRenderer.sendMessage(Channel.PLAYER_2_WIN, {
        type: 'trackInfo',
        data: {
          id: 0,
          title:
            this.listenMoeTrackData.title.length >= 50
              ? this.listenMoeTrackData.title.substring(0, 50)
              : this.listenMoeTrackData.title,
          duration: this.listenMoeTrackData.duration || 0,
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
        getSnapshot(track)
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
        playlist.id
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
      this.isShuffling
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
  setWebsocketConnected(val: boolean) {
    this.websocketConnected = val;
  }

  @modelAction
  setLivestreamSource(source: string) {
    if (source === 'listen.moe') {
      if (!this.websocketConnected) {
        // Connect to listenMoe websocket
        ListenMoeWebsocket.connect();
        // Listen for successfull connection
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ListenMoeWebsocket.ws!.onopen = () => {
          clearInterval(ListenMoeWebsocket.heartbeatInterval);
          ListenMoeWebsocket.heartbeatInterval = undefined;
          this.setWebsocketConnected(true);
        };
      }
    }

    this.currentTrack = undefined;
    this.livestreamSource = source;
  }

  @modelAction
  setListenMoeData(data: IListenMoeTrackData) {
    this.listenMoeTrackData = data;
  }

  @modelFlow
  favoriteSong = _async(function* (this: Player) {
    yield* _await(ListenMoeApiClient.favorite(this.listenMoeTrackData!.id));
    this.listenMoeTrackData!.favorite = true;
  });

  @modelFlow
  deFavoriteSong = _async(function* (this: Player) {
    yield* _await(ListenMoeApiClient.favorite(this.listenMoeTrackData!.id));
    this.listenMoeTrackData!.favorite = false;
  });

  @modelAction
  setExternalPlayerVersion(version: string) {
    this.externalPlayerVersion = version;
  }
}

export default Player;
