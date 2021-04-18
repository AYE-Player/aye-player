import {
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  Ref,
  _async,
  _await
} from "mobx-keystone";
import { decodeHTMLEntities } from "../../helpers";
import ApiClient from "../api/ApiClient";
import Track from "../models/Track";
import trackRef from "../references/TrackRef";

@model("SearchResult")
export default class SearchResult extends Model({
  tracks: prop<Ref<Track>[]>(() => [])
}) {
  get isEmpty() {
    return this.tracks.length === 0;
  }

  @modelFlow
  getTracks = _async(function*(term: string) {
    const data = yield* _await(ApiClient.searchTrack(term));
    const tracks = [];

    for (const track of data) {
      tracks.push({
        id: track.Id,
        duration: track.Duration,
        title: decodeHTMLEntities(track.Title)
      });
    }

    return tracks;
  });

  @modelFlow
  getTrackFromUrl = _async(function*(this: SearchResult, url: string) {
    const data = yield* _await(ApiClient.getTrackFromUrl(url));

    let parsedData = {
      id: data.Id,
      title: decodeHTMLEntities(data.Title),
      duration: data.Duration
    };
    return parsedData;
  });

  @modelAction
  addTracks(tracks: Track[]) {
    for (const track of tracks) {
      this.tracks.push(trackRef(track.id));
    }
  }

  @modelAction
  clear() {
    this.tracks.length = 0;
  }
}
