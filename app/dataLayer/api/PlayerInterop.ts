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
        this.setInitState();
      }
    }
  }

  setInitValues({
    track,
    volume,
    isMuted
  }: {
    track?: TrackModel;
    volume?: number;
    isMuted?: boolean;
  }) {
    if (track) {
      this.initTrack = track;
    }
    if (volume) {
      this.volume = volume;
    }
    if (isMuted !== undefined) {
      this.isMuted = isMuted;
    }
  }

  setInitState() {
    if (this.player) {
        this.player.contentWindow.postMessage(
          {
            type: OutgoingMessageType.INIT,
            track: this.initTrack,
            startAt: this.startAt ? this.startAt : undefined,
            volume: this.volume,
            muted: this.isMuted
          },
          Root.stores.app.devMode
            ? "http://localhost:3000"
            : "https://player.aye-player.de"
        );
      this.initTrack = undefined;
      this.startAt = undefined;
      this.volume = undefined;
      this.isMuted = undefined;
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
