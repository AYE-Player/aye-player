// import axios from "axios";
import { flow, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import Playlist, { PlaylistModel } from "../models/Playlist";
import axios from "axios";
import Track from "../models/Track";
import Root from "../../containers/Root";

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
        const token = localStorage.getItem("token");
        // @ts-ignore
        const { data: id } = yield axios.post(
          "https://api.aye-player.de/v1/playlists",
          {
            Name: name
          },
          {
            headers: {
              "x-access-token": token
            }
          }
        );

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
        const token = localStorage.getItem("token");
        // @ts-ignore
        const { data: id } = yield axios.post(
          "https://api.aye-player.de/v1/playlists/by-urls",
          {
            Name: name,
            Songs: songs
          },
          {
            headers: {
              "x-access-token": token
            }
          }
        );

        const { data: pl } = yield axios.get(
          `https://api.aye-player.de/v1/playlists/${id}`,
          {
            headers: {
              "x-access-token": token
            }
          }
        );

        const playlist = Playlist.create({
          name,
          id,
          duration: pl.Duration,
          trackCount: pl.SongsCount,
          tracks: []
        });

        const { data: tracks } = yield axios.get(
          `https://api.aye-player.de/v1/playlists/${id}/songs?skip=0&take=${songs.length}`,
          {
            headers: {
              "x-access-token": token
            }
          }
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
        yield axios.delete(`https://api.aye-player.de/v1/playlists/${id}`, {
          headers: {
            "x-access-token": localStorage.getItem("token")
          }
        });
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
