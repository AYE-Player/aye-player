import { types, Instance } from "mobx-state-tree";
import { TrackModel } from "./Track";

export type PlayerModel = Instance<typeof Player>;

const Player = types
  .model({
    volume: types.optional(types.number, 0.2),
    videoId: types.optional(types.string, "XeGsq5yQOXw"),
    repeat: types.optional(types.boolean, false),
    repeatOne: types.optional(types.boolean, false),
    shuffle: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
    playing: types.optional(types.boolean, false),
    muted: types.optional(types.boolean, false),
    seeking: types.optional(types.boolean, false),
    playbackPosition: types.optional(types.number, 0),
    duration: types.optional(types.number, 0)
  })
  .views(self => ({
    get getVolume() {
      return self.volume;
    },
    get getVideoId() {
      return self.videoId;
    },
    get repeatStatus() {
      return self.repeat;
    },
    get repeatOneStatus() {
      return self.repeatOne;
    },
    get shuffleStatus() {
      return self.shuffle;
    },
    get readyState() {
      return self.ready;
    },
    get isPlaying() {
      return self.playing;
    },
    get isMuted() {
      return self.muted;
    },
    get isSeeking() {
      return self.seeking;
    },
    get trackDuration() {
      return self.duration;
    },
    get getPlaybackPosition() {
      return self.playbackPosition;
    }
  }))
  .actions(self => ({
    playTrack(track: TrackModel) {
      self.playing = true;
      self.videoId = track.id;
    },

    setRepeat(state: boolean) {
      if (self.shuffle) {
        self.shuffle = false;
      }
      self.repeat = state;
    },

    setRepeatOne(state: boolean) {
      if (self.shuffle) {
        self.shuffle = false;
      }
      self.repeatOne = state;
    },

    setVolume(vol: number) {
      self.volume = vol;
    },

    setReadyState() {
      self.ready = true;
    },

    togglePlayingState() {
      self.playing = !self.playing;
    },

    toggleShuffleState() {
      if (self.repeatOne || self.repeat) {
        self.repeatOne = false;
        self.repeat = false;
      }
      self.shuffle = !self.shuffle;
    },

    toggleMute(val: boolean) {
      self.muted = val;
    },

    setSeeking(val: boolean) {
      self.seeking = val;
    },

    setDuration(dur: number) {
      self.duration = dur;
    },

    setPlaybackPosition(pos: number) {
      self.playbackPosition = pos;
    }
  }));

export default Player;
