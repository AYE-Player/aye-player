import { model, Model, prop } from "mobx-keystone";
import TrackCache from "./TrackCache";
import User from "../models/User";
import AppStore from "./AppStore";
import Player from "../models/Player";
import Playlists from "./Playlists";
import Queue from "./Queue";
import TrackHistory from "./TrackHistory";
import SearchResult from "./SearchResult";

@model("RootStore")
export default class RootStore extends Model({
  app: prop<AppStore>(),
  player: prop<Player>(),
  playlists: prop<Playlists>(),
  queue: prop<Queue>(),
  trackCache: prop<TrackCache>(),
  trackHistory: prop<TrackHistory>(),
  searchResult: prop<SearchResult>(),
  user: prop<User>()
}) {}
