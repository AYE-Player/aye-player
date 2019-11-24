import { clone, types, flow } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";
// import axios from "axios";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";

export type PlaylistModel = typeof Playlist.Type;

const Playlist = types
  .model({
    id: types.identifier,
    name: types.maybe(types.string),
    tracks: types.maybe(types.array(types.reference(Track)))
  })
  .views(self => ({
    getTrackById(id: string) {
      if (!self.tracks) return null;
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
    /*afterCreate: flow(function*() {
      try {
        // @ts-ignore
        const { data: id } = yield axios.post(
          "https://api.aye-player.de/playlists",
          {
            name: self.name
          }
        );
        self.id = id;
      } catch (error) {
        AyeLogger.player(
          `Error setting ID ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
      }
    }),*/
    addTrack: flow(function*(track: TrackModel) {
      try {
        self.tracks.push(track);
        /*yield axios.put(`https://api.aye-player.de/playlists/${self.id}/songs`, {
          track
        });*/
      } catch (error) {
        AyeLogger.player(
          `Error adding track to playlist ${self.id} ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    removeTrack: flow(function*(track: TrackModel) {
      try {
        const foundTrack = self.tracks.find(trk => trk.id === track.id);
        const idx = self.tracks.indexOf(foundTrack);
        self.tracks.splice(idx, 1);
        /*yield axios.delete(
          `https://api.aye-player.de/playlists/${self.id}/songs/${track.id}`
        );*/
      } catch (error) {
        AyeLogger.player(
          `Error remove track from playlist ${self.id} ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    removeTrackById(id: string) {
      const foundTrack = self.tracks.find(trk => trk.id === id);
      const idx = self.tracks.indexOf(foundTrack);
      self.tracks.splice(idx, 1);
    },

    removeAndGetTrack(idx: number) {
      const track = clone(self.tracks[idx]);
      self.tracks.splice(idx, 1);
      return track;
    },

    addTrackAt(track: TrackModel, newIndex: number) {
      self.tracks.splice(newIndex, 0, track);
    }
  }));

export default Playlist;
