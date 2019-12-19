import { clone, flow, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import Track, { TrackModel } from "./Track";
import ApiClient from "../api/ApiClient";
import Root from "../../containers/Root";

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
        if (self.tracks.length > self.trackCount) {
          self.trackCount = self.trackCount + 1;
          self.duration = self.duration + track.duration;
        }
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

    addTracksByUrls: flow(function*(name: string, songs: { Url: string }[]) {
      try {
        yield ApiClient.addTracksToPlaylistByUrls(self.id, songs);

        const { data: pl } = yield ApiClient.getPlaylist(self.id);

        //@ts-ignore
        const { data: tracks } = yield ApiClient.getTracksFromPlaylist(
          self.id,
          pl.SongsCount
        );

        for (const track of tracks) {
          let tr = Root.stores.trackCache.getTrackById(track.id);

          if (!tr) {
            tr = Track.create({
              id: track.Id,
              title: track.Title,
              duration: track.Duration,
              isLivestream: false
            });
            Root.stores.trackCache.add(tr);
          }

          self.tracks.push(tr);
        }

        self.duration = pl.Duration;
        self.trackCount = pl.SongsCount;
      } catch (error) {
        console.error(error);
        AyeLogger.player(
          `[addTracksByUrls] Error adding Tracks ${JSON.stringify(
            error,
            null,
            2
          )}`,
          LogType.ERROR
        );
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
