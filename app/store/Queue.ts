import { types, Instance, getRoot, resolveIdentifier } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";

export type QueueModel = Instance<typeof Queue>;

const Queue = types
  .model({
    tracks: types.optional(types.array(types.string), [])
  })
  .views(self => ({
    get currentTrack() {
      const root = getRoot(self);
      if (!self.tracks) return null;
      return resolveIdentifier(Track, root, self.tracks[0]);
    },
    get randomTrack() {
      const idx = Math.floor(Math.random() * self.tracks.length);
      const track = self.tracks[idx];
      self.tracks.splice(idx, 1);
      return track;
    }
  }))
  .actions(self => ({
    addTracks(tracks: TrackModel[]) {
      for (const track of tracks) {
        self.tracks.push(track.id);
      }
    },
    addPrivilegedTrack(track: TrackModel) {
      self.tracks.unshift(track.id);
    },
    nextTrack() {
      self.tracks.shift()
      if (self.tracks.length === 0) return null;

      return self.tracks[0];
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
