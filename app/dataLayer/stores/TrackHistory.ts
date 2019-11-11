import { getRoot, Instance, resolveIdentifier, types } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";

export type TrackHistoryModel = Instance<typeof TrackHistory>;

const TrackHistory = types
  .model({
    tracks: types.array(types.reference(Track))
  })
  .views(self => ({
    get currentTrack() {
      const root = getRoot(self);
      if (!self.tracks || self.tracks.length === 0) return null;
      return resolveIdentifier(Track, root, self.tracks[0].id);
    },

    get isEmpty() {
      return self.tracks.length === 0;
    }
  }))
  .actions(self => ({
    addTrack(track: TrackModel) {
      self.tracks.push(track);
    },

    getLatestTrack() {
      if (self.tracks.length === 0) return null;
      return self.tracks.pop();
    },

    clear() {
      self.tracks.length = 0;
    }
  }));

export default TrackHistory;
