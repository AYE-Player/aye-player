import { types, Instance } from "mobx-state-tree";
import Playlist, { PlaylistModel } from "../models/Playlist";

export type PlaylistsModel = Instance<typeof Playlists>;

const Playlists = types
  .model({
    lists: types.optional(types.array(Playlist), [])
  })
  .views(self => ({
    getListById(id: string) {
      return self.lists.find(list => list.id === id);
    }
  }))
  .actions(self => ({
    add(playlist: PlaylistModel) {
      self.lists.push(playlist);
    }
  }));

export default Playlists;
