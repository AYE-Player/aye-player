import { clone, types, flow } from "mobx-state-tree";
import Track, { TrackModel } from "./Track";
import axios from "axios";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";

export type PlaylistModel = typeof Playlist.Type;

const Playlist = types
  .model({
    id: types.identifier,
    name: types.maybe(types.string),
    tracks: types.maybe(types.array(types.reference(Track))),
    trackCount: types.optional(types.number, 0),
    duration: types.optional(types.number, 0)
  })
  .named("Playlist")
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
    addTrack: flow(function*(track: TrackModel) {
      try {
        yield axios.put(
          `https://api.aye-player.de/v1/playlists/${self.id}/songs`,
          {
            Id: track.id,
            Duration: track.duration,
            Title: track.title,
            IsLivestream: track.isLivestream
          },
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );

        self.trackCount = self.trackCount + 1;
        self.duration = self.duration + track.duration;
        self.tracks.push(track);
      } catch (error) {
        AyeLogger.player(
          `Error adding track to playlist ${self.id} ${JSON.stringify(
            error,
            null,
            2
          )}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    addLoadedTrack: flow(function*(track: TrackModel) {
      try {
        self.tracks.push(track);
      } catch (error) {
        AyeLogger.player(
          `Error adding track to playlist ${self.id} ${JSON.stringify(
            error,
            null,
            2
          )}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    removeTrack: flow(function*(track: TrackModel) {
      try {
        yield axios.delete(
          `https://api.aye-player.de/v1/playlists/${self.id}/songs/${track.id}`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );

        self.trackCount = self.trackCount - 1;
        self.duration = self.duration - track.duration;

        const foundTrack = self.tracks.find(trk => trk.id === track.id);
        const idx = self.tracks.indexOf(foundTrack);
        self.tracks.splice(idx, 1);
      } catch (error) {
        AyeLogger.player(
          `Error remove track from playlist ${self.id} ${JSON.stringify(
            error,
            null,
            2
          )}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    removeTrackById: flow(function*(id: string) {
      try {
        yield axios.delete(
          `https://api.aye-player.de/v1/playlists/${self.id}/songs/${id}`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );
        const foundTrack = self.tracks.find(trk => trk.id === id);
        const idx = self.tracks.indexOf(foundTrack);
        self.tracks.splice(idx, 1);
      } catch (error) {
        AyeLogger.player(
          `Error remove track from playlist ${self.id} ${JSON.stringify(
            error,
            null,
            2
          )}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    removeAndGetTrack(idx: number) {
      const track = clone(self.tracks[idx]);
      self.tracks.splice(idx, 1);
      return track;
    },

    addTrackAt: flow(function*(track: TrackModel, newIndex: number) {
      try {
        yield axios.patch(
          `https://api.aye-player.de/v1/playlists/${self.id}/songs/${track.id}`,
          [
            {
              op: "replace",
              path: "OrderId",
              value: newIndex
            }
          ],
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );
        self.tracks.splice(newIndex, 0, track);
      } catch (error) {}
    })
  }));

export default Playlist;
