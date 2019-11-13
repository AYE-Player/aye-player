import { ipcRenderer } from "electron";
import { Instance, types } from "mobx-state-tree";
import { Repeat } from "../../types/enums";
import Playlist, { PlaylistModel } from "../models/Playlist";
import Track, { TrackModel } from "../models/Track";

export type PlayerModel = Instance<typeof Player>;

interface IRPCState {
  track?: TrackModel;
  state?: string;
}

const Player = types
  .model({
    volume: types.number,
    repeat: types.string,
    isShuffling: types.boolean,
    isReady: types.boolean,
    isPlaying: types.boolean,
    isMuted: types.boolean,
    isSeeking: types.boolean,
    playbackPosition: types.number,
    currentTrack: types.maybe(types.safeReference(Track)),
    currentPlaylist: types.maybe(types.safeReference(Playlist))
  })
  .actions(self => ({
    playTrack(track: TrackModel) {
      self.playbackPosition = 0;
      self.currentTrack = track;
      if (!self.isPlaying) self.isPlaying = true;

      new Notification(`Now Playing: ${track.title}`, {
        icon: `https://img.youtube.com/vi/${self.currentTrack.id}/hqdefault.jpg`,
        silent: true
      });
      this.notifyRPC({ track });
    },

    notifyRPC({ track, state }: IRPCState = {}) {
      if (!track) {
        track = self.currentTrack;
      }

      ipcRenderer.send("setDiscordActivity", {
        playbackPosition: self.playbackPosition,
        endTime: state ? null : track.duration,
        details: track.title,
        state: state ? state : null
      });

      ipcRenderer.send("player2Win", {
        type: "trackInfo",
        data: {
          id: self.currentTrack.id,
          title: self.currentTrack.title,
          duration: self.currentTrack.duration
        }
      });
    },

    setRepeatStatus(status: Repeat) {
      self.repeat = status;
    },

    setVolume(vol: number) {
      self.volume = vol;
    },

    setCurrentTrack(track?: TrackModel) {
      if (track) {
        self.currentTrack = track;
      } else {
        self.currentTrack = undefined;
      }
    },

    setCurrentPlaylist(playlist?: PlaylistModel) {
      if (playlist) {
        self.currentPlaylist = playlist;
      } else {
        self.currentPlaylist = undefined;
      }
    },

    setReadyState() {
      self.isReady = true;
    },

    togglePlayingState() {
      if (self.isPlaying) {
        this.notifyRPC({ state: "Paused" });
      } else {
        this.notifyRPC();
      }
      self.isPlaying = !self.isPlaying;

      ipcRenderer.send("player2Win", {
        type: "onStateChange",
        data: self.isPlaying
      });
    },

    toggleShuffleState() {
      if (self.repeat === Repeat.ALL || self.repeat === Repeat.ALL) {
        self.repeat = Repeat.NONE;
      }
      self.isShuffling = !self.isShuffling;
    },

    mute() {
      self.isMuted = true;
    },

    unmute() {
      self.isMuted = false;
    },

    setSeeking(state: boolean) {
      self.isSeeking = state;
    },

    setPlaybackPosition(pos: number) {
      self.playbackPosition = pos;
    }
  }));

export default Player;
