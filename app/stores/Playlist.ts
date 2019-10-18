import { types, Instance } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";

export type PlaylistModel = Instance<typeof Playlist>;

const Playlist = types
  .model({
    id: types.identifier,
    tracks: types.array(Track)
  })
  .views(self => ({
    getTrackById(id: string) {
      return self.tracks.find(track => track.id === id);
    },

    getIndexOfTrack(track: TrackModel) {
      return self.tracks.indexOf(track);
    },

    getTracksStartingFrom(idx: number) {
      return self.tracks.slice(idx);
    }
  }))
  .actions(self => ({
    addTrack(track: TrackModel) {
      self.tracks.push(track);
    },

    removeTrack(track: TrackModel) {
      const foundTrack = self.tracks.find(trk => trk.id === track.id);
      const idx = self.tracks.indexOf(foundTrack);
      self.tracks.splice(idx, 1);
    },

    removeTrackById(id: string) {
      const foundTrack = self.tracks.find(trk => trk.id === id);
      const idx = self.tracks.indexOf(foundTrack);
      self.tracks.splice(idx, 1);
    }
  }));

export default Playlist;
