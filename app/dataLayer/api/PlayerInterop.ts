class PlayerInterop {
  player: any;

  init() {
    if (!this.player) {
      this.player = document.querySelector("#embedded-player") as any;
    }
  }

  // TODO: why does this have to be any?
  setTrack(track: any) {
    console.log(track);
    this.player.contentWindow.postMessage(
      {
        type: "setTrack",
        track
      },
      "https://player.aye-player.de"
    );
  }

  playTrack(track: any) {
    console.log(track);
    this.player.contentWindow.postMessage(
      {
        type: "playTrack",
        track
      },
      "https://player.aye-player.de"
    );
  }

  seekTo(newValue: number) {
    this.player.contentWindow.postMessage(
      {
        type: "volume",
        volume: newValue / 100
      },
      "https://player.aye-player.de"
    );
  }

  setVolume(newValue: number) {
    this.player.contentWindow.postMessage(
      {
        type: "volume",
        volume: newValue / 100
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
