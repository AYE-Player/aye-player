import { model, Model, modelAction, prop } from "mobx-keystone";
import Track from "../models/Track";

@model("TrackCache")
export default class TrackCache extends Model({
  tracks: prop<Track[]>()
}) {
  getTrackById(id: string) {
    return this.tracks.find(track => track.id === id);
  }

  @modelAction
  add(track: Track) {
    this.tracks.push(track);
  }

  @modelAction
  removeTrack(id: string) {
    const foundTrack = this.tracks.find(track => track.id === id);
    const idx = this.tracks.indexOf(foundTrack);
    this.tracks.splice(idx, 1);
  }
}
