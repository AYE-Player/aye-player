import { clone, flow, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import Track, { TrackModel } from "./Track";
import ApiClient from "../api/ApiClient";

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
        yield ApiClient.addTrackToPlaylist(self.id, track);

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
        yield ApiClient.removeTrackFromPlaylistById(self.id, track.id);

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
        yield ApiClient.removeTrackFromPlaylistById(self.id, id);
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

    moveTrackTo: flow(function*(oldIndex: number, newIndex: number) {
      try {
        const track = clone(self.tracks[oldIndex]);

        yield ApiClient.moveTrackTo(self.id, track.id, newIndex);

        self.tracks.splice(oldIndex, 1);
        self.tracks.splice(newIndex, 0, track);
      } catch (error) {
        AyeLogger.player(
          `Error changing Track order ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
        throw error;
      }
    })
  }));

export default Playlist;
