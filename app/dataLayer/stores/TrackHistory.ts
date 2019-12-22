import { model, Model, modelAction, prop, Ref } from "mobx-keystone";
import Track from "../models/Track";

@model("TrackHistory")
export default class TrackHistory extends Model({
  tracks: prop<Ref<Track>[]>()
}) {
  get isEmpty() {
    return this.tracks.length === 0;
  }

  @modelAction
  addTrack(id: Ref<Track>) {
    this.tracks.push(id);
  }

  @modelAction
  removeAndGetTrack() {
    return this.tracks.splice(this.tracks.length - 1, 1)[0];
  }
}
