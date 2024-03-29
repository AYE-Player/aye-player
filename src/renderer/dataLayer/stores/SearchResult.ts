import {
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  Ref,
  _async,
  _await,
} from 'mobx-keystone';
import { decodeHTMLEntities } from '../../../helpers';
import { getTrackFromUrl, searchTrack } from '../api/fetchers';
import Track from '../models/Track';
import trackRef from '../references/TrackRef';

@model('SearchResult')
class SearchResult extends Model({
  tracks: prop<Ref<Track>[]>(() => []),
  searching: prop(false),
}) {
  get isEmpty() {
    return this.tracks.length === 0;
  }

  @modelFlow
  getTracks = _async(function* (this: SearchResult, term: string) {
    this.searching = true;
    const data = yield* _await(searchTrack(term));
    const tracks = [];

    for (const track of data) {
      tracks.push({
        id: track.id,
        duration: track.duration,
        title: decodeHTMLEntities(track.title),
      });
    }

    this.searching = false;

    return tracks;
  });

  @modelFlow
  getTrackFromUrl = _async(function* (this: SearchResult, url: string) {
    const data = yield* _await(getTrackFromUrl(url));

    return {
      id: data.id,
      title: decodeHTMLEntities(data.title),
      duration: data.duration,
    };
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

export default SearchResult;
