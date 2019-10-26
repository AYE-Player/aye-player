import { types, Instance } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";

import { ipcRenderer } from "electron";
import Playlist, { PlaylistModel } from "../models/Playlist";

export type PlayerModel = Instance<typeof Player>;

const Player = types
  .model({
    volume: types.optional(types.number, 0.2),
    loopPlaylist: types.optional(types.boolean, false),
    loopTrack: types.optional(types.boolean, false),
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

    notifyRPC({ track, state }: { track?: TrackModel; state?: string }) {
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

    setLoopPlaylist(state: boolean) {
      if (self.isShuffling) {
        self.isShuffling = false;
      }
      self.loopPlaylist = state;
    },

    setLoopTrack(state: boolean) {
      if (self.isShuffling) {
        self.isShuffling = false;
      }
      self.loopTrack = state;
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
    },

    toggleShuffleState() {
      if (self.loopTrack || self.loopPlaylist) {
        self.loopTrack = false;
        self.loopPlaylist = false;
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
