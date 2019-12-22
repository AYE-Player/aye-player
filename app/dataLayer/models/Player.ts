import { ipcRenderer } from "electron";
import { model, Model, modelAction, prop, Ref, getSnapshot } from "mobx-keystone";
import { Repeat } from "../../types/enums";
import Playlist from "./Playlist";
import Track from "./Track";
import playlistRef from "../references/PlaylistRef";
import Settings from "../stores/PersistentSettings";

interface IRPCState {
  track?: Track;
  state?: string;
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
  currentTrack: prop<Ref<Track> | undefined>(),
  currentPlaylist: prop<Ref<Playlist> | undefined>()
}) {
  @modelAction
  playTrack(track: Ref<Track>) {
    this.playbackPosition = 0;
    Settings.set("playerSettings.playbackPosition", 0);

    this.currentTrack = track;
    Settings.delete("playerSettings.currentTrack");
    Settings.set("playerSettings.currentTrack", getSnapshot(track.current));

    if (!this.isPlaying) this.isPlaying = true;

    new Notification(`Now Playing: ${this.currentTrack.current.title}`, {
      icon: `https://img.youtube.com/vi/${this.currentTrack.id}/hqdefault.jpg`,
      silent: true
    });
    this.notifyRPC();
  }

  notifyRPC({ state }: IRPCState = {}) {
    if (state === "Idle") {
      ipcRenderer.send("setDiscordActivity", {
        details: "Idle"
      });
      return;
    }

    ipcRenderer.send("setDiscordActivity", {
      playbackPosition: this.playbackPosition,
      endTime: state ? null : this.currentTrack.current.duration,
      details: this.currentTrack.current.title,
      state: state ? state : null,
      duration: this.currentTrack.current.duration
    });

    ipcRenderer.send("player2Win", {
      type: "trackInfo",
      data: {
        id: this.currentTrack.id,
        title: this.currentTrack.current.title,
        duration: this.currentTrack.current.duration
      }
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
  setCurrentTrack(track?: Ref<Track>) {
    if (track) {
      this.currentTrack = track;
      Settings.delete("playerSettings.currentTrack");
      Settings.set("playerSettings.currentTrack", getSnapshot(track.current));
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
      data: this.isPlaying
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
      data: this.playbackPosition
    });
  }

  @modelAction
  setPlaying(state: boolean) {
    this.isPlaying = state;
  }
}
