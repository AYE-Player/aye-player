import { Instance, types } from "mobx-state-tree";
import Player, { PlayerModel } from "./Player";
import Playlist, { PlaylistModel } from "./Playlist";
import Queue, { QueueModel } from "./Queue";

export type RootStoreModel = Instance<typeof RootStore>;
export type RootStoreEnv = {
  player: PlayerModel;
  playlist: PlaylistModel;
  queue: QueueModel;
};

const RootStore = types.model("RootStore", {
  player: Player,
  playlist: Playlist,
  queue: Queue,
});

export default RootStore;
