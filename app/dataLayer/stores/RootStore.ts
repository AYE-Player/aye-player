import { Instance, types } from "mobx-state-tree";
import Player, { PlayerModel } from "./Player";
import Playlist, { PlaylistModel } from "./Playlist";
import Queue, { QueueModel } from "./Queue";
import User, { UserModel } from "../models/User";
import AppStore, { AppStoreModel } from "./AppStore";

export type RootStoreModel = Instance<typeof RootStore>;
export type RootStoreEnv = {
  player: PlayerModel;
  playlist: PlaylistModel;
  queue: QueueModel;
  user: UserModel;
  app: AppStoreModel;
};

const RootStore = types.model("RootStore", {
  player: Player,
  playlist: Playlist,
  queue: Queue,
  user: User,
  app: AppStore
});

export default RootStore;
