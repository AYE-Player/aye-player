import { detach, rootRef } from "mobx-keystone";
import Playlist from "../models/Playlist";

const playlistRef = rootRef<Playlist>("PlaylistRef", {
  getId(maybePlaylist) {
    return maybePlaylist instanceof Playlist ? maybePlaylist.id : undefined;
  },

  onResolvedValueChange(ref, newPlaylist, oldPlaylist) {
    if (oldPlaylist && !newPlaylist) {
      detach(ref);
    }
  }
});

export default playlistRef;
