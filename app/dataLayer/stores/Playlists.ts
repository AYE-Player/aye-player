import {
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  _async,
  _await
} from "mobx-keystone";
import Root from "../../containers/Root";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import ApiClient from "../api/ApiClient";
import Playlist from "../models/Playlist";
import Track from "../models/Track";

@model("Playlists")
export default class Playlists extends Model({
  lists: prop<Playlist[]>()
}) {
  getListById(id: string) {
    return this.lists.find(list => list.id === id);
  }

  @modelFlow
  createList = _async(function*(this: Playlists, name: string) {
    try {
      const { data: id } = yield* _await(ApiClient.createPlaylist(name));

      const playlist = new Playlist({
        name,
        id,
        tracks: []
      });

      this.lists.push(playlist);

      return playlist;
    } catch (error) {
      AyeLogger.player(
        `[createList] Error setting ID ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
    }
  });

  @modelFlow
  createListWithSongs = _async(function*(
    name: string,
    songs: { Url: string }[]
  ) {
    try {
      const { data: id } = yield* _await(
        ApiClient.createPlaylistWithSongs(name, songs)
      );

      const { data: pl } = yield* _await(ApiClient.getPlaylist(id));

      const playlist = new Playlist({
        name,
        id,
        duration: pl.Duration,
        trackCount: pl.SongsCount,
        tracks: []
      });

      const { data: tracks } = yield* _await(
        ApiClient.getTracksFromPlaylist(id, pl.SongsCount)
      );

      for (const track of tracks) {
        const tr = new Track({
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

      this.lists.push(playlist);

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
  });

  @modelAction
  add(playlist: Playlist) {
    this.lists.push(playlist);
  }

  @modelFlow
  remove = _async(function*(this: Playlists, id: string) {
    try {
      yield* _await(ApiClient.deletePlaylist(id));
      const foundList = this.lists.find(playlist => playlist.id === id);
      const idx = this.lists.indexOf(foundList);
      this.lists.splice(idx, 1);
    } catch (error) {
      AyeLogger.player(
        `Error deleting Playlist ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelAction
  clear() {
    this.lists.length = 0;
  }
}
