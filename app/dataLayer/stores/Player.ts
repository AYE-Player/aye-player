import { ipcRenderer } from "electron";
import { Instance, types } from "mobx-state-tree";
import Playlist, { PlaylistModel } from "../models/Playlist";
import Track, { TrackModel } from "../models/Track";
import { Repeat } from "../../types/interfaces";

export type PlayerModel = Instance<typeof Player>;

interface IRPCState {
  track?: TrackModel;
  state?: string;
}

const Player = types
  .model({
    volume: types.optional(types.number, 0.2),
    repeat: types.optional(types.string, "none"),
    isShuffling: types.optional(types.boolean, false),
    isReady: types.optional(types.boolean, false),
    isPlaying: types.optional(types.boolean, false),
    isMuted: types.optional(types.boolean, false),
    isSeeking: types.optional(types.boolean, false),
    playbackPosition: types.optional(types.number, 0),
    currentTrack: types.maybe(types.reference(Track)),
    currentPlaylist: types.maybe(types.reference(Playlist))
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
      if (self.isPlaying) this.notifyRPC({ state: "Paused" });
      self.isPlaying = !self.isPlaying;

      ipcRenderer.send("player2Win", ["onStateChange", self.isPlaying]);
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
