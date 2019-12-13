import { TrackModel } from "../models/Track";

class PlayerInterop {
  player: any;
  initTrack: TrackModel;
  startAt: number;

  // TODO: refactor/debug this, and only set/init/load player and initTrack, when its needed
  init() {
    if (!this.player) {
      this.player = document.querySelector("#embedded-player") as any;
      if (this.initTrack && this.player) {
        this.setTrack(this.initTrack);
        if (this.startAt) {
          setTimeout(this.seekTo(this.startAt), 500);
          console.log("setting pbp to (INIT)", this.startAt)
        }
      }
    }
  }

  setInitTrack(track: TrackModel) {
    if (this.player) {
      this.setTrack(track);
      if (this.startAt) {
        setTimeout(this.seekTo(this.startAt), 500);
      }
    } else {
      this.initTrack = track;
    }
  }

  setStartTime(val: number) {
    this.startAt = val;
  }

  setTrack(track?: TrackModel) {
    this.player.contentWindow.postMessage(
      {
        type: "setTrack",
        track: track ? track : undefined
      },
      "https://player.aye-player.de"
    );
  }

  playTrack(track: TrackModel) {
    this.player.contentWindow.postMessage(
      {
        type: "playTrack",
        track
      },
      "https://player.aye-player.de"
    );
  }

  seekTo(time: number) {
    this.player.contentWindow.postMessage(
      {
        type: "seek",
        time
      },
      "https://player.aye-player.de"
    );
  }

  setVolume(newVolume: number) {
    this.player.contentWindow.postMessage(
      {
        type: "volume",
        volume: newVolume / 100
      },
      "https://player.aye-player.de"
    );
  }

  togglePlayingState() {
    this.player.contentWindow.postMessage(
      {
        type: "togglePlayingState"
      },
      "https://player.aye-player.de"
    );
  }

  setLooping(state: boolean) {
    this.player.contentWindow.postMessage(
      {
        type: "setLooping",
        state
      },
      "https://player.aye-player.de"
    );
  }

  mute(state: boolean) {
    this.player.contentWindow.postMessage(
      {
        type: "toggleMute",
        state
      },
      "https://player.aye-player.de"
    );
  }
}

export default new PlayerInterop();
