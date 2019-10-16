import RootStore, { RootStoreModel, RootStoreEnv } from "./RootStore";
import Player from "./Player";
import Playlist from "./Playlist";

// could possibly accept some initial state
export const createStore = (): RootStoreModel => {
  const playlist = Playlist.create();
  const player = Player.create();

  const env: RootStoreEnv = { player: player, playlist: playlist };

  const rootStore = RootStore.create(
    {
      player: player,
      playlist: playlist
    },
    env
  );

  return rootStore;
};
