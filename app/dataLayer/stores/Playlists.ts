import { flow, types } from "mobx-state-tree";
import Root from "../../containers/Root";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import ApiClient from "../api/ApiClient";
import Playlist, { PlaylistModel } from "../models/Playlist";
import Track from "../models/Track";

export type PlaylistsModel = typeof Playlists.Type;

const Playlists = types
  .model({
    lists: types.array(Playlist)
  })
  .views(self => ({
    getListById(id: string) {
      return self.lists.find(list => list.id === id);
    }
  }))
  .actions(self => ({
    createList: flow(function*(name: string) {
      try {
        // @ts-ignore
        const { data: id } = yield ApiClient.createPlaylist(name);

        const playlist = Playlist.create({
          name,
          id,
          tracks: []
        });

        self.lists.push(playlist);

        return playlist;
      } catch (error) {
        AyeLogger.player(
          `[createList] Error setting ID ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
      }
    }),

    createListWithSongs: flow(function*(
      name: string,
      songs: { Url: string }[]
    ) {
      try {
        // @ts-ignore
        const { data: id } = yield ApiClient.createPlaylistWithSongs(
          name,
          songs
        );

        const { data: pl } = yield ApiClient.getPlaylist(id);

        const playlist = Playlist.create({
          name,
          id,
          duration: pl.Duration,
          trackCount: pl.SongsCount,
          tracks: []
        });

        //@ts-ignore
        const { data: tracks } = yield ApiClient.getTracksFromPlaylist(
          id,
          pl.SongsCount
        );

        for (const track of tracks) {
          const tr = Track.create({
            id: track.Id,
            title: track.Title,
            duration: track.Duration,
            isLivestream: false
          });

          if (!Root.stores.trackCache.getTrackById(track.id)) {
            Root.stores.trackCache.add(tr);
          }

          playlist.addLoadedTrack(tr);
        }

        self.lists.push(playlist);

        return playlist;
      } catch (error) {
        console.error(error);
        AyeLogger.player(
          `[createListWithSongs] Error setting ID ${JSON.stringify(
            error,
            null,
            2
          )}`,
          LogType.ERROR
        );
      }
    }),

    add(playlist: PlaylistModel) {
      self.lists.push(playlist);
    },

    remove: flow(function*(id: string) {
      try {
        yield ApiClient.deletePlaylist(id);
        const foundList = self.lists.find(playlist => playlist.id === id);
        const idx = self.lists.indexOf(foundList);
        self.lists.splice(idx, 1);
      } catch (error) {
        AyeLogger.player(
          `Error deleting Playlist ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    clear() {
      self.lists.length = 0;
    }
  }));

export default Playlists;
