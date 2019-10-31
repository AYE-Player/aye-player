import { Instance, types } from "mobx-state-tree";
import User, { UserModel } from "../models/User";
import AppStore, { AppStoreModel } from "./AppStore";
import Player, { PlayerModel } from "./Player";
import Playlists, { PlaylistsModel } from "./Playlists";
import Queue, { QueueModel } from "./Queue";
import TrackStore, { TrackStoreModel } from "./Tracks";
import TrackHistory, { TrackHistoryModel } from "./TrackHistory";

export type RootStoreModel = Instance<typeof RootStore>;
export type RootStoreEnv = {
  player: PlayerModel;
  playlists: PlaylistsModel;
  queue: QueueModel;
  user: UserModel;
  app: AppStoreModel;
  tracks: TrackStoreModel;
  trackHistory: TrackHistoryModel;
};

const RootStore = types.model("RootStore", {
  player: Player,
  playlists: Playlists,
  queue: Queue,
  user: User,
  app: AppStore,
  tracks: TrackStore,
  trackHistory: TrackHistory
});

export default RootStore;
