import { ipcRenderer } from "electron";
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
} from "mobx-keystone";
import { Repeat } from "../../types/enums";
import playlistRef from "../references/PlaylistRef";
import trackRef from "../references/TrackRef";
import Settings from "../stores/PersistentSettings";
import Playlist from "./Playlist";
import Track from "./Track";
import ListenMoeWebsocket from "../api/ListenMoeWebsocket";
import RootStore from "../stores/RootStore";
import ListenMoeApiClient from "../api/ListenMoeApiClient";

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

@model("Player")
export default class Player extends Model({
  volume: prop<number>(),
  repeat: prop<Repeat>(),
  isShuffling: prop<boolean>(),
  isReady: prop<boolean>(),
  isPlaying: prop<boolean>(),
  isMuted: prop<boolean>(),
  isSeeking: prop<boolean>(),
  playbackPosition: prop<number>(),
  radioActive: prop<boolean>(),
  currentTrack: prop<Maybe<Ref<Track>>>(),
  currentPlaylist: prop<Maybe<Ref<Playlist>>>(),
  livestreamSource: prop<string>(),
  websocketConnected: prop(false),
  listenMoeTrackData: prop<Maybe<IListenMoeTrackData>>(),
  externalPlayerVersion: prop<string>({ setterAction: true }),
}) {
  @modelAction
  playTrack(track: Track) {
    const { app } = getRoot<RootStore>(this);

    this.playbackPosition = 0;
    Settings.set("playerSettings.playbackPosition", 0);

    this.currentTrack = trackRef(track);
    Settings.delete("playerSettings.currentTrack");
    Settings.set("playerSettings.currentTrack", getSnapshot(track));

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
    if (state === "Idle") {
      ipcRenderer.send("setDiscordActivity", {
        details: "Idle",
      });
      return;
    }

    if (this.currentTrack?.current.isLivestream) {
      ipcRenderer.send("setDiscordActivity", {
        details:
          this.currentTrack.current.title.length >= 128
            ? `${this.currentTrack.current.title.substr(0, 123)}...`
            : this.currentTrack.current.title,
        state: state ?? null,
      });
    } else {
      if (this.currentTrack) {
        ipcRenderer.send("player2Win", {
          type: "isYoutube",
        });

        ipcRenderer.send("setDiscordActivity", {
          playbackPosition: this.playbackPosition,
          endTime: state ? null : this.currentTrack.current.duration,
          details:
            this.currentTrack.current.title.length >= 128
              ? `${this.currentTrack.current.title.substr(0, 123)}...`
              : this.currentTrack.current.title,
          state: state ?? null,
          duration: this.currentTrack.current.duration,
        });
        ipcRenderer.send("player2Win", {
          type: "trackInfo",
          data: {
            id: this.currentTrack.current.id || 0,
            title: this.currentTrack.current.title,
            duration: this.currentTrack.current.duration || 0,
          },
        });
      } else if (this.listenMoeTrackData) {
        ipcRenderer.send("player2Win", {
          type: "isRadio",
        });

        const details = `${this.listenMoeTrackData.artists} - ${this.listenMoeTrackData.title} (Listen.moe)`;

        ipcRenderer.send("setDiscordActivity", {
          playbackPosition: this.playbackPosition,
          endTime: this.listenMoeTrackData.duration,
          startTimestamp: this.listenMoeTrackData.startTime,
          details:
            details.length >= 128 ? `${details.substr(0, 123)}...` : details,
          state: null,
          duration: this.listenMoeTrackData.duration,
        });
        ipcRenderer.send("player2Win", {
          type: "trackInfo",
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

    ipcRenderer.send("player2Win", {
      type: "trackInfo",
      data: {
        id: this.currentTrack?.current.id || 0,
        title:
          this.currentTrack?.current.title ||
          this.listenMoeTrackData?.title.length >= 50
            ? this.listenMoeTrackData?.title.substring(0, 50)
            : this.listenMoeTrackData?.title,
        duration:
          this.currentTrack?.current.duration ||
          this.listenMoeTrackData?.duration ||
          0,
      },
    });
  }

  @modelAction
  setRepeat(status: Repeat) {
    this.repeat = status;
  }

  @modelAction
  setVolume(vol: number) {
    this.volume = vol;
  }

  @modelAction
  setMute(state: boolean) {
    this.isMuted = state;
  }

  @modelAction
  setShuffling(state: boolean) {
    this.isShuffling = state;
  }

  @modelAction
  setCurrentTrack(track?: Track) {
    if (track) {
      this.currentTrack = trackRef(track);
      Settings.delete("playerSettings.currentTrack");
      Settings.set("playerSettings.currentTrack", getSnapshot(track));
    } else {
      this.currentTrack = undefined;
    }
  }

  @modelAction
  setCurrentPlaylist(playlist?: Playlist) {
    if (playlist) {
      this.currentPlaylist = playlistRef(playlist);
      Settings.delete("playerSettings.currentPlaylist");
      Settings.set("playerSettings.currentPlaylist.id", playlist.id);
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
      this.notifyRPC({ state: "Paused" });
    }

    ipcRenderer.send("player2Win", {
      type: "onStateChange",
      data: this.isPlaying,
    });
  }

  @modelAction
  toggleShuffleState() {
    if (this.repeat === Repeat.ONE || this.repeat === Repeat.ALL) {
      this.repeat = Repeat.NONE;
    }

    this.isShuffling = !this.isShuffling;
  }

  @modelAction
  mute() {
    this.isMuted = true;
  }

  @modelAction
  unmute() {
    this.isMuted = false;
  }

  @modelAction
  setSeeking(state: boolean) {
    this.isSeeking = state;
  }

  @modelAction
  setPlaybackPosition(pos: number) {
    this.playbackPosition = pos;

    ipcRenderer.send("player2Win", {
      type: "currentTime",
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
    if (source === "listen.moe") {
      if (!this.websocketConnected) {
        // Connect to listenMoe websocket
        ListenMoeWebsocket.connect();
        // Listen for successfull connection
        ListenMoeWebsocket.ws.onopen = () => {
          console.log(
            "%c> [ListenMoe] Websocket connection established.",
            "color: #008000;"
          );
          clearInterval(ListenMoeWebsocket.heartbeatInterval);
          ListenMoeWebsocket.heartbeatInterval = null;
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
    yield* _await(ListenMoeApiClient.favorite(this.listenMoeTrackData.id));
    this.listenMoeTrackData.favorite = true;
  });

  @modelFlow
  deFavoriteSong = _async(function* (this: Player) {
    yield* _await(ListenMoeApiClient.favorite(this.listenMoeTrackData.id));
    this.listenMoeTrackData.favorite = false;
  });
}
