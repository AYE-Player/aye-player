import {
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  _async,
  _await,
} from "mobx-keystone";
import Root from "../../containers/Root";
import ApiClient from "../api/ApiClient";
import Playlist from "../models/Playlist";
import Track from "../models/Track";

@model("Playlists")
export default class Playlists extends Model({
  lists: prop<Playlist[]>(),
}) {
  getListById(id: string) {
    return this.lists.find((list) => list.id === id);
  }

  @modelFlow
  createList = _async(function* (this: Playlists, name: string) {
    const id = yield* _await(ApiClient.createPlaylist(name));

    const playlist = new Playlist({
      name,
      id,
      tracks: [],
    });

    this.lists.push(playlist);

    return playlist;
  });

  @modelFlow
  createListWithSongs = _async(function* (
    name: string,
    songs: { Url: string }[]
  ) {
    const id = yield* _await(ApiClient.createPlaylistWithSongs(name, songs));

    const pl = yield* _await(ApiClient.getPlaylist(id));

    const playlist = new Playlist({
      name,
      id,
      duration: pl.Duration,
      trackCount: pl.SongsCount,
      tracks: [],
    });

    const tracks = yield* _await(
      ApiClient.getTracksFromPlaylist(id, pl.SongsCount)
    );

    for (const track of tracks) {
      const tr = new Track({
        id: track.Id,
        title: track.Title,
        duration: track.Duration,
        isLivestream: false,
      });

      if (!Root.stores.trackCache.getTrackById(track.Id)) {
        Root.stores.trackCache.add(tr);
      }

      playlist.addLoadedTrack(tr);
    }

    this.lists.push(playlist);

    return playlist;
  });

  @modelAction
  add(playlist: Playlist) {
    this.lists.push(playlist);
  }

  @modelFlow
  remove = _async(function* (this: Playlists, id: string, subscribed: boolean) {
    if (subscribed) {
      yield* _await(ApiClient.unsubscribePlaylist(id));
    } else {
      yield* _await(ApiClient.deletePlaylist(id));
    }

    this.lists.splice(
      this.lists.findIndex((playlist) => playlist.id === id),
      1
    );
  });

  @modelAction
  clear() {
    this.lists.length = 0;
  }
}
