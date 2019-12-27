import { model, Model, modelAction, prop, Ref } from "mobx-keystone";
import Track from "../models/Track";
import trackRef from "../references/TrackRef";

@model("TrackHistory")
export default class TrackHistory extends Model({
  tracks: prop<Ref<Track>[]>()
}) {
  get isEmpty() {
    return this.tracks.length === 0;
  }

  @modelAction
  addTrack(track: Track) {
    this.tracks.push(trackRef(track));
  }

  @modelAction
  removeAndGetTrack() {
    const track = this.tracks[this.tracks.length - 1].current;
    this.tracks.splice(this.tracks.length - 1, 1);
    return track;
  }
}
