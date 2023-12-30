import {
  getRoot,
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  _async,
  _await,
} from 'mobx-keystone';
import Playlist from '../models/Playlist';
import Track from '../models/Track';
import RootStore from './RootStore';
import {
  createPlaylist,
  createPlaylistWithSongs,
  deletePlaylist,
} from '../api/fetchers';
import { IPlaylistDto } from '../api/graphQLTypes';

@model('Playlists')
class Playlists extends Model({
  lists: prop<Playlist[]>(),
}) {
  getListById(id: string) {
    return this.lists.find((list) => list.id === id);
  }

  @modelFlow
  createList = _async(function* (this: Playlists, name: string) {
    const playlistDTO: IPlaylistDto = yield* _await(createPlaylist(name));

    const playlist = new Playlist({
      name: playlistDTO.name,
      id: playlistDTO.id,
      tracks: [],
    });

    this.lists.push(playlist);

    return playlist;
  });

  @modelFlow
  createListWithSongs = _async(function* (
    this: Playlists,
    name: string,
    songs: { url: string }[],
  ) {
    const playlistDTO = yield* _await(createPlaylistWithSongs(name, songs));

    const playlist = new Playlist({
      name,
      id: playlistDTO.id,
      duration: playlistDTO.duration,
      trackCount: playlistDTO.songCount,
      tracks: [],
    });

    for (const { id, title, duration } of playlistDTO.songs!) {
      const tr = new Track({
        id,
        title,
        duration,
        isLivestream: false,
      });

      const { trackCache } = getRoot<RootStore>(this);
      if (!trackCache.getTrackById(id)) {
        trackCache.add(tr);
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
  remove = _async(function* (this: Playlists, id: string) {
    yield* _await(deletePlaylist(id));

    this.lists.splice(
      this.lists.findIndex((playlist) => playlist.id === id),
      1,
    );
  });

  @modelAction
  clear() {
    this.lists.length = 0;
  }
}

export default Playlists;
