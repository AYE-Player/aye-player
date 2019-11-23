import { types } from "mobx-state-tree";
import Playlist, { PlaylistModel } from "../models/Playlist";

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
    add(playlist: PlaylistModel) {
      self.lists.push(playlist);
    },

    remove(id: string) {
      const foundList = self.lists.find(playlist => playlist.id === id);
      const idx = self.lists.indexOf(foundList);
      self.lists.splice(idx, 1);
    },

    clear() {
      self.lists.length = 0;
    }
  }));

export default Playlists;
