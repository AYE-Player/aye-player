import { Instance, types } from "mobx-state-tree";
import Player, { PlayerModel } from "./Player";
import Playlist, { PlaylistModel } from "./Playlist";

export type RootStoreModel = Instance<typeof RootStore>;
export type RootStoreEnv = {
  player: PlayerModel;
  playlist: PlaylistModel;
};

const RootStore = types.model("RootStore", {
  player: Player,
  playlist: Playlist
});

export default RootStore;
