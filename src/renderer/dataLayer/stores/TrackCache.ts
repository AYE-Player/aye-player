import { model, Model, modelAction, prop } from 'mobx-keystone';
import Track from '../models/Track';

@model('TrackCache')
class TrackCache extends Model({
  tracks: prop<Track[]>(() => []),
}) {
  getTrackById(id: string) {
    return this.tracks.find((track) => track.id === id);
  }

  @modelAction
  add(track: Track) {
    this.tracks.push(track);
  }

  @modelAction
  removeTrack(id: string) {
    this.tracks.splice(
      this.tracks.findIndex((track) => track.id === id),
      1,
    );
  }
}

export default TrackCache;
