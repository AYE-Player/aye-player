import { clone, getRoot, Instance, resolveIdentifier, types } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";

export type QueueModel = Instance<typeof Queue>;

const Queue = types
  .model({
    tracks: types.array(types.reference(Track))
  })
  .views(self => ({
    get currentTrack() {
      const root = getRoot(self);
      if (!self.tracks || self.tracks.length === 0) return null;
      return resolveIdentifier(Track, root, self.tracks[0].id);
    },

    get randomTrack() {
      const idx = Math.floor(Math.random() * self.tracks.length);
      const track = self.tracks[idx];
      self.tracks.splice(idx, 1);
      return track;
    },

    get isEmpty() {
      return self.tracks.length === 0;
    }
  }))
  .actions(self => ({
    addTracks(tracks: TrackModel[]) {
      for (const track of tracks) {
        self.tracks.push(track.id);
      }
    },

    addTrack(id: string) {
      self.tracks.push(id);
    },

    addTrackAt(track: TrackModel, newIndex: number) {
      self.tracks.splice(newIndex, 0, track);
    },

    removeTrack(id: string) {
      const foundList = self.tracks.find(track => track.id === id);
      const idx = self.tracks.indexOf(foundList);
      self.tracks.splice(idx, 1);
    },

    jumpTo(idx: number) {
      self.tracks.splice(0, idx);
    },

    addPrivilegedTrack(track: TrackModel) {
      self.tracks.unshift(track.id);
    },

    addNextTrack(id: string) {
      self.tracks.splice(1, 0, id);
    },

    nextTrack() {
      self.tracks.shift();
      if (self.tracks.length === 0) return null;

      return self.tracks[0];
    },

    removeAndGetTrack(index: number) {
      const track = clone(self.tracks[index]);
      self.tracks.splice(index, 1);
      return track;
    },

    moveTrack(oldIndex: number, newIndex: number) {
      const track = self.tracks[oldIndex].id;
      self.tracks.splice(oldIndex, 1);
      self.tracks.splice(newIndex, 0, track);
    },

    clear() {
      self.tracks.length = 0;
    },

    shuffel() {
      // https://www.frankmitchell.org/2015/01/fisher-yates/
      let i = 0;
      let j = 0;
      let temp = null;

      for (i = self.tracks.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = self.tracks[i];
        self.tracks[i] = self.tracks[j];
        self.tracks[j] = temp;
      }
    }
  }));

export default Queue;
