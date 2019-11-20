import axios from "axios";
import { flow, types } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";
import { decodeHTMLEntities } from "../../helpers";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";

export type SearchResultModel = typeof SearchResult.Type;

const SearchResult = types
  .model({
    tracks: types.array(types.reference(Track))
  })
  .views(self => ({
    get isEmpty() {
      return self.tracks.length === 0;
    }
  }))
  .actions(self => ({
    getTracks: flow(function*(term: string) {
      try {
        const { data } = yield axios.get(
          `https://api.aye-player.de/search/v1/${term}`
        );
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
        throw error;
      }
    }),
    getTrackFromUrl: flow(function*(url: string) {
      try {
        const { data } = yield axios.get(
          `https://api.aye-player.de/search/v1/song?songUrl=${encodeURIComponent(
            url
          )}`
        );

        let parsedData = {
          id: data.Id,
          title: data.Title,
          duration: data.Duration
        };
        return parsedData;
      } catch (error) {
        AyeLogger.player(error, LogType.ERROR);
        throw error;
      }
    }),

    addTracks(tracks: TrackModel[]) {
      for (const track of tracks) {
        self.tracks.push(track.id);
      }
    },

    clear() {
      self.tracks.length = 0;
    }
  }));

export default SearchResult;
