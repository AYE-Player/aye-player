import { TrackModel } from "../models/Track";
import Root from "../../containers/Root";
import { OutgoingMessageType } from "../../types/enums";

class PlayerInterop {
  player: any;
  initTrack: TrackModel;
  startAt: number;
  volume: number;
  isMuted: boolean;

  init() {
    if (!this.player) {
      this.player = document.querySelector("#embedded-player") as any;
      if (this.initTrack && this.player) {
        this.setInitState({
          track: this.initTrack,
          volume: this.volume,
          isMuted: this.isMuted
        });
      }
    }
  }

  setInitState({
    track,
    volume,
    isMuted
  }: {
    track?: TrackModel;
    volume?: number;
    isMuted?: boolean;
  }) {
    if (this.player) {
      this.player.contentWindow.postMessage(
        {
          type: OutgoingMessageType.SET_TRACK,
          track: track,
          startAt: this.startAt ? this.startAt : undefined
        },
        Root.stores.app.devMode
          ? "http://localhost:3000"
          : "https://player.aye-player.de"
      );
      this.setVolume(volume);
      this.setMute(isMuted);
      this.initTrack = undefined;
      this.volume = undefined;
    } else {
      this.initTrack = track;
      this.volume = volume;
      this.isMuted = isMuted;
    }
  }

  setStartTime(val: number) {
    this.startAt = val;
  }

  setTrack(track?: TrackModel) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SET_TRACK,
        track: track ? track : undefined
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }

  playTrack(track: TrackModel) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.PLAY_TRACK,
        track
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }

  seekTo(time: number) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SEEK,
        time
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }

  setVolume(newVolume: number) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.VOLUME,
        volume: newVolume / 100
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }

  togglePlayingState() {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.TOGGLE_PLAYING_STATE
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }

  setLooping(state: boolean) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SET_LOOPING,
        state
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }

  setMute(state: boolean) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.MUTE,
        state
      },
      Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de"
    );
  }
}

export default new PlayerInterop();
