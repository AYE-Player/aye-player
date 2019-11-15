import { types } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";

export type TrackStoreModel = typeof TrackStore.Type;

const TrackStore = types
  .model({
    tracks: types.array(Track)
  })
  .views(self => ({
    getTrackById(id: string) {
      return self.tracks.find(track => track.id === id);
    }
  }))
  .actions(self => ({
    add(track: TrackModel) {
      self.tracks.push(track);
      return track;
    },

    removeTrack(id: string) {
      const foundList = self.tracks.find(track => track.id === id);
      const idx = self.tracks.indexOf(foundList);
      self.tracks.splice(idx, 1);
    }
  }));

export default TrackStore;
