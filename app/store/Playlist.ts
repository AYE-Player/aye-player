import { types, Instance } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";

export type PlaylistModel = Instance<typeof Playlist>;

const Playlist = types
  .model({
    Tracks: types.optional(types.array(Track), [])
  })
  .views(self => ({
    get getPlaylist() {
      return self.Tracks;
    },
    getTrackFromIndex(idx: number) {
      return self.Tracks[idx];
    },
    get getCurrentTrack() {
      return self.Tracks[0];
    },
    get getNextTrack() {
      return self.Tracks[1];
    }
  }))
  .actions(self => ({
    addTrack(track: TrackModel) {
      self.Tracks.push(track);
    },

    removeTrack() {
      self.Tracks.pop();
    },

    shuffelPlaylist() {
      // https://www.frankmitchell.org/2015/01/fisher-yates/
      let i = 0;
      let j = 0;
      let temp = null;

      for (i = self.Tracks.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = self.Tracks[i];
        self.Tracks[i] = self.Tracks[j];
        self.Tracks[j] = temp;
      }
    }
  }));

export default Playlist;
