import { types, Instance } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";

export type PlaylistModel = Instance<typeof Playlist>;

const Playlist = types
  .model({
    Tracks: types.array(Track)
  })
  .views(self => ({
    getTrackById(id: string) {
      return self.Tracks.find(track => track.id === id);
    },
    get previewNextTrack() {
      if (self.Tracks.length <= 1) return null;
      return self.Tracks[1];
    },
    get randomTrack() {
      const idx = Math.floor(Math.random() * self.Tracks.length);
      const track = self.Tracks[idx];
      self.Tracks.splice(idx, 1);
      return track;
    }
  }))
  .actions(self => ({
    addTrack(track: TrackModel) {
      self.Tracks.push(track);
    },

    addPrivilegedTrack(track: TrackModel) {
      self.Tracks.unshift(track);
    },

    removeTrack(track: TrackModel) {
      const foundTrack = self.Tracks.find(trk => trk.id === track.id);
      const idx = self.Tracks.indexOf(foundTrack);
      self.Tracks.splice(idx, 1);
    },

    nextTrack() {
      self.Tracks.shift();
      if (self.Tracks.length === 0) return null;
      return self.Tracks[0];
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
