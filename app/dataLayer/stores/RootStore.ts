import { model, Model, prop } from "mobx-keystone";
import Player from "../models/Player";
import User from "../models/User";
import AppStore from "./AppStore";
import Playlists from "./Playlists";
import Queue from "./Queue";
import SearchResult from "./SearchResult";
import TrackCache from "./TrackCache";
import TrackHistory from "./TrackHistory";

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
