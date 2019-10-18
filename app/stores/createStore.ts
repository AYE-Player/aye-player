import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Playlist from "./Playlist";
import Queue from "./Queue";
import User from "./User";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const playlist = Playlist.create({
    id: "1"
  });
  const player = Player.create();
  const queue = Queue.create({
    tracks: []
  });
  const user = User.create({
    id: "1",
    name: "MajesNix",
    email: "majesnix@majesnix.org"
  });

  const env: RootStoreEnv = {
    player: player,
    playlist: playlist,
    queue: queue,
    user: user
  };

  const rootStore = RootStore.create(
    {
      player,
      playlist,
      queue,
      user
    },
    env
  );

  return rootStore;
};
