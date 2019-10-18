import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Playlist from "./Playlist";
import Queue from "./Queue";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const playlist = Playlist.create();
  const player = Player.create();
  const queue = Queue.create({
    tracks: undefined
  });

  const env: RootStoreEnv = {
    player: player,
    playlist: playlist,
    queue: queue
  };

  const rootStore = RootStore.create(
    {
      player,
      playlist,
      queue
    },
    env
  );

  return rootStore;
};
