import { getSnapshot, SnapshotOutOfModel } from "mobx-keystone";
import Root from "../../containers/Root";
import { OutgoingMessageType } from "../../types/enums";
import Track from "../models/Track";

class PlayerInterop {
  private player: any;
  private apiUrl: string;
  private initTrack: SnapshotOutOfModel<Track>;
  private startAt: number;
  private volume: number;
  private isMuted: boolean;

  init() {
    if (!this.player) {
      this.player = document.querySelector("#embedded-player") as any;
      this.apiUrl = Root.stores.app.devMode
        ? "http://localhost:3000"
        : "https://player.aye-playr.de";
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
    track?: Track;
    volume?: number;
    isMuted?: boolean;
  }) {
    if (track) {
      this.initTrack = getSnapshot(track);
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
          startAt: this.startAt ?? undefined,
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

  setTrack(track?: Track) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.SET_TRACK,
        track: track ? getSnapshot(track) : undefined
      },
      this.apiUrl
    );
  }

  playTrack(track: Track) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.PLAY_TRACK,
        track: getSnapshot(track)
      },
      this.apiUrl
    );
  }

  playLivestream(streamURL: string) {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.PLAY_STREAM,
        track: {
          source: "livestream",
          streamURL,
          isLivestream: true
        }
      },
      this.apiUrl
    );
  }

  reconnectLivestream() {
    this.player.contentWindow.postMessage(
      {
        type: OutgoingMessageType.RECONNECT_STREAM
      },
      this.apiUrl
    )
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
