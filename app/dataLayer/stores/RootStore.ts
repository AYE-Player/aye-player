import { types } from "mobx-state-tree";
import User, { UserModel } from "../models/User";
import AppStore, { AppStoreModel } from "./AppStore";
import Player, { PlayerModel } from "../models/Player";
import Playlists, { PlaylistsModel } from "./Playlists";
import Queue, { QueueModel } from "./Queue";
import SearchResult, { SearchResultModel } from "./SearchResult";
import TrackHistory, { TrackHistoryModel } from "./TrackHistory";
import TrackStore, { TrackStoreModel } from "./TrackCache";

export type RootStoreModel = typeof RootStore.Type;

export type RootStoreEnv = {
  player: PlayerModel;
  playlists: PlaylistsModel;
  queue: QueueModel;
  user: UserModel;
  app: AppStoreModel;
  trackCache: TrackStoreModel;
  trackHistory: TrackHistoryModel;
  searchResult: SearchResultModel;
};

const RootStore = types.model("RootStore", {
  player: Player,
  playlists: Playlists,
  queue: Queue,
  user: User,
  app: AppStore,
  trackCache: TrackStore,
  trackHistory: TrackHistory,
  searchResult: SearchResult
});

export default RootStore;
