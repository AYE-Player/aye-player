import { types, Instance } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";

export type PlayerModel = Instance<typeof Player>;

const Player = types
  .model({
    volume: types.optional(types.number, 20),
    videoId: types.optional(types.string, "U6C2oCyTJ9s"),
    repeat: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
    autoPlay: types.optional(types.number, 0),
    currentTrack: types.maybe(Track)
  })
  .views(self => ({
    get getVolume() {
      return self.volume;
    },
    get getVideoId() {
      return self.videoId;
    },
    get getRepeatStatus() {
      return self.repeat;
    },
    get getReadyState() {
      return self.ready;
    },
    get getAutoplayState() {
      return self.autoPlay;
    },
    get getCurrentTrack() {
      return self.currentTrack;
    }
  }))
  .actions(self => ({
    playTrack(id: string) {
      self.autoPlay = 1;
      self.videoId = id;
    },

    toggleRepeat() {
      self.repeat = !self.repeat;
    },

    setVolume(vol: number) {
      self.volume = vol;
    },

    setReadyState() {
      self.ready = true;
    },

    setCurrentTrack(track: TrackModel) {
      self.currentTrack = track;
    }
  }));

export default Player;
