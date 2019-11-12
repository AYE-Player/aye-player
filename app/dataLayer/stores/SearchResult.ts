import axios from "axios";
import { flow, Instance, types } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";

export type SearchResultModel = Instance<typeof SearchResult>;

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
    getTracks: flow(function* getTracks(term: string) {
      try {
        const { data } = yield axios.get(
          `http://api.aye-player.de/search/v1/${term}`
        );
        const tracks = [];

        for (const track of data) {
          tracks.push({
            id: track.Id,
            duration: track.Duration,
            title: track.Title
          });
        }

        return tracks;
      } catch (error) {
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
