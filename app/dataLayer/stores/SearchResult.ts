import {
  model,
  Model,
  modelAction,
  prop,
  Ref,
  _async,
  _await,
  modelFlow
} from "mobx-keystone";
import { decodeHTMLEntities } from "../../helpers";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import ApiClient from "../api/ApiClient";
import Track from "../models/Track";
import trackRef from "../references/TrackRef";

@model("SearchResult")
export default class SearchResult extends Model({
  tracks: prop<Ref<Track>[]>()
}) {
  get isEmpty() {
    return this.tracks.length === 0;
  }

  @modelFlow
  getTracks = _async(function*(term: string) {
    try {
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
    } catch (error) {
      AyeLogger.player(
        `[SearchResult] Error retrieving tracks ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelFlow
  getTrackFromUrl = _async(function*(this: SearchResult, url: string) {
    try {
      const data = yield* _await(ApiClient.getTrackFromUrl(url));

      let parsedData = {
        id: data.Id,
        title: decodeHTMLEntities(data.Title),
        duration: data.Duration
      };
      return parsedData;
    } catch (error) {
      AyeLogger.player(
        `[SearchResult] Error retrieving track from url ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
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
