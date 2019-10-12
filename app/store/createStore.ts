import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Playlist from "./Playlist";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const player = Player.create();
  const playlist = Playlist.create();

  const env: RootStoreEnv = { player: player, playlist: playlist };

  const rootStore = RootStore.create(
    {
      player,
      playlist
    },
    env
  );

  return rootStore;
};
