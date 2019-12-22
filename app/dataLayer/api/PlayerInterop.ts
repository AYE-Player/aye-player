import Track from "../models/Track";
import Root from "../../containers/Root";
import { OutgoingMessageType } from "../../types/enums";
import { getSnapshot, Ref } from "mobx-keystone";

class PlayerInterop {
  private player: any;
  private apiUrl: string;
  private initTrack: Ref<Track>;
  private startAt: number;
  private volume: number;
  private isMuted: boolean;

  init() {
    if (!this.player) {
      this.player = document.querySelector("#embedded-player") as any;
      this.apiUrl = Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-player.de";
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
    track?: Ref<Track>;
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
          track: getSnapshot(this.initTrack),
          startAt: this.startAt ? this.startAt : undefined,
          volume: this.volume,
          muted: this.isMuted
        },
        this.apiUrl
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

  setTrack(track?: Ref<Track>) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SET_TRACK,
        track: track ? getSnapshot(track) : undefined
      },
      this.apiUrl
    );
  }

  playTrack(track: Ref<Track>) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.PLAY_TRACK,
        track: getSnapshot(track)
      },
      this.apiUrl
    );
  }

  seekTo(time: number) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SEEK,
        time
      },
      this.apiUrl
    );
  }

  setVolume(newVolume: number) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.VOLUME,
        volume: newVolume / 100
      },
      this.apiUrl
    );
  }

  togglePlayingState() {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.TOGGLE_PLAYING_STATE
      },
      this.apiUrl
    );
  }

  setLooping(state: boolean) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SET_LOOPING,
        state
      },
      this.apiUrl
    );
  }

  setMute(state: boolean) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.MUTE,
        state
      },
      this.apiUrl
    );
  }
}

export default new PlayerInterop();
