import { Instance, types } from "mobx-state-tree";
import Player, { PlayerModel } from "./Player";
import Playlists, { PlaylistsModel } from "./Playlists";
import Queue, { QueueModel } from "./Queue";
import User, { UserModel } from "../models/User";
import AppStore, { AppStoreModel } from "./AppStore";
import Playlist, { PlaylistModel } from "../models/Playlist";

export type RootStoreModel = Instance<typeof RootStore>;
export type RootStoreEnv = {
  player: PlayerModel;
  playlist: PlaylistModel;
  playlists: PlaylistsModel;
  queue: QueueModel;
  user: UserModel;
  app: AppStoreModel;
};

const RootStore = types.model("RootStore", {
  player: Player,
  playlist: Playlist,
  playlists: Playlists,
  queue: Queue,
  user: User,
  app: AppStore
});

export default RootStore;
