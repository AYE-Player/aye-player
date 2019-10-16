import { types, Instance, getRoot, resolveIdentifier } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";

export type PlayerModel = Instance<typeof Player>;

const Player = types
  .model({
    volume: types.optional(types.number, 0.2),
    repeatPlaylist: types.optional(types.boolean, false),
    loopTrack: types.optional(types.boolean, false),
    isShuffling: types.optional(types.boolean, false),
    isReady: types.optional(types.boolean, false),
    isPlaying: types.optional(types.boolean, false),
    isMuted: types.optional(types.boolean, false),
    isSeeking: types.optional(types.boolean, false),
    playbackPosition: types.optional(types.number, 0),
    currentTrackId: types.maybe(types.string)
  })
  .views(self => ({
    get currentTrack() {
      const root = getRoot(self);
      return resolveIdentifier(Track, root, self.currentTrackId);
    }
  }))
  .actions(self => ({
    playTrack(track: TrackModel) {
      self.currentTrackId = track.id;
      self.isPlaying = true;
    },

    setRepeatPlaylist(state: boolean) {
      if (self.isShuffling) {
        self.isShuffling = false;
      }
      self.repeatPlaylist = state;
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

    setCurrentTrack(id: string) {
      self.currentTrackId = id;
    },

    setReadyState() {
      self.isReady = true;
    },

    togglePlayingState() {
      self.isPlaying = !self.isPlaying;
    },

    toggleShuffleState() {
      if (self.loopTrack || self.repeatPlaylist) {
        self.loopTrack = false;
        self.repeatPlaylist = false;
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
