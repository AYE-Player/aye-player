// import axios from "axios";
import { flow, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
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

    remove: flow(function*(id: string) {
      try {
        // yield axios.delete(`https://api.aye-player.de/playlists/${id}`);
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
