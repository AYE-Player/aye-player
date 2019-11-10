import { Instance, types, flow } from "mobx-state-tree";
import Track, { TrackModel } from "../models/Track";
import axios from "axios";

export type SearchResultModel = Instance<typeof SearchResult>;

const SearchResult = types
  .model({
    tracks: types.array(types.safeReference(Track))
  })
  .views(self => ({
    get isEmpty() {
      return self.tracks.length === 0;
    }
  }))
  .actions(self => ({
    search: flow(function* register(term: string) {
      try {
        const { data } = yield axios.get(`http://api.aye-player.de/search/v1/${term}`);
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
