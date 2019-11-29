import { types, clone } from "mobx-state-tree";
import Track from "../models/Track";

export type TrackHistoryModel = typeof TrackHistory.Type;

const TrackHistory = types
  .model({
    tracks: types.array(types.reference(Track))
  })
  .views(self => ({
    get isEmpty() {
      return self.tracks.length === 0;
    }
  }))
  .actions(self => ({
    addTrack(id: string) {
      self.tracks.push(id);
    },

    removeAndGetTrack() {
      const track = clone(self.tracks[self.tracks.length - 1]);
      if (!track) return null;
      self.tracks.splice(self.tracks.length - 1, 1);
      return track;
    },

    clear() {
      self.tracks.length = 0;
    }
  }));

export default TrackHistory;
