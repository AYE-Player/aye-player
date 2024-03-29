import { getSnapshot, SnapshotOutOfModel } from 'mobx-keystone';
import { debugUrl, playerUrl } from 'renderer/constants';
import { rootStore } from '../../containers/Root';
import { OutgoingMessageType } from '../../../types/enums';
import Track from '../models/Track';

class PlayerInterop {
  private player!: HTMLIFrameElement;

  private apiUrl = '';

  private initTrack: SnapshotOutOfModel<Track> | undefined;

  private startAt: number | undefined;

  private volume: number | undefined;

  private isMuted: boolean | undefined;

  private looping: boolean | undefined;

  init() {
    if (!this.player) {
      this.player = document.querySelector(
        '#embedded-player',
      ) as HTMLIFrameElement;
      this.apiUrl = rootStore.app.devMode ? debugUrl : playerUrl;
      if (this.initTrack && this.player) {
        this.setInitState();
      }
    }
  }

  setInitValues({
    track,
    volume,
    isMuted,
    looping,
  }: {
    track?: Track;
    volume?: number;
    isMuted?: boolean;
    looping?: boolean;
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
    if (looping) {
      this.looping = looping;
    }
  }

  setInitState() {
    if (this.player) {
      this.player.contentWindow?.postMessage(
        {
          type: OutgoingMessageType.INIT,
          track: this.initTrack,
          startAt: this.startAt ?? undefined,
          volume: this.volume,
          muted: this.isMuted,
        },
        this.apiUrl,
      );
      this.setLooping(!!this.looping);

      this.initTrack = undefined;
      this.startAt = undefined;
      this.volume = undefined;
      this.isMuted = undefined;
      this.looping = undefined;
    }
  }

  setStartTime(val: number) {
    this.startAt = val;
  }

  setTrack(track?: Track) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.SET_TRACK,
        track: track ? getSnapshot(track) : undefined,
      },
      this.apiUrl,
    );
  }

  playTrack(track: Track) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.PLAY_TRACK,
        track: getSnapshot(track),
      },
      this.apiUrl,
    );
  }

  playLivestream(streamURL: string) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.PLAY_STREAM,
        track: {
          source: 'livestream',
          streamURL,
          isLivestream: true,
        },
      },
      this.apiUrl,
    );
  }

  reconnectLivestream() {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.RECONNECT_STREAM,
      },
      this.apiUrl,
    );
  }

  seekTo(time: number) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.SEEK,
        time,
      },
      this.apiUrl,
    );
  }

  setVolume(newVolume: number) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.VOLUME,
        volume: newVolume / 100,
      },
      this.apiUrl,
    );
  }

  togglePlayingState() {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.TOGGLE_PLAYING_STATE,
      },
      this.apiUrl,
    );
  }

  setLooping(state: boolean) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.SET_LOOPING,
        state,
      },
      this.apiUrl,
    );
  }

  setMute(state: boolean) {
    this.player.contentWindow?.postMessage(
      {
        type: OutgoingMessageType.MUTE,
        state,
      },
      this.apiUrl,
    );
  }
}

export default new PlayerInterop();
