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
  user: UserModel;
  player: PlayerModel;
  playlists: PlaylistsModel;
  queue: QueueModel;
  app: AppStoreModel;
  trackCache: TrackStoreModel;
  trackHistory: TrackHistoryModel;
  searchResult: SearchResultModel;
};

const RootStore = types.model("RootStore", {
  user: User,
  player: Player,
  playlists: Playlists,
  queue: Queue,
  app: AppStore,
  trackCache: TrackStore,
  trackHistory: TrackHistory,
  searchResult: SearchResult
});

export default RootStore;
