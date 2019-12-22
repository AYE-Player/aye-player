import { model, Model, modelAction, prop, Ref, clone } from "mobx-keystone";
import Track from "../models/Track";
import trackRef from "../references/TrackRef";

@model("Queue")
export default class Queue extends Model({
  tracks: prop<Ref<Track>[] | undefined>()
}) {
  get currentTrack() {
    if (!this.tracks || this.tracks.length === 0) return null;
    return this.tracks[0];
  }

  get isEmpty() {
    return this.tracks.length === 0;
  }

  @modelAction
  addTracks(tracks: Track[]) {
    for (const track of tracks) {
      this.tracks.push(trackRef(track));
    }
  }

  @modelAction
  addTrack(track: Track) {
    this.tracks.push(trackRef(track));
  }

  @modelAction
  addTrackAt(track: Track, newIndex: number) {
    this.tracks.splice(newIndex, 0, trackRef(track));
  }

  @modelAction
  removeTrack(id: string) {
    const foundList = this.tracks.find(track => track.id === id);
    const idx = this.tracks.indexOf(foundList);
    this.tracks.splice(idx, 1);
  }

  @modelAction
  jumpTo(idx: number) {
    this.tracks.splice(0, idx);
  }

  @modelAction
  addPrivilegedTrack(track: Track) {
    this.tracks.unshift(trackRef(track));
  }

  @modelAction
  addNextTrack(track: Track) {
    this.tracks.splice(1, 0, trackRef(track));
  }

  @modelAction
  nextTrack() {
    this.tracks.shift();
    if (this.tracks.length === 0) return null;

    return this.tracks[0];
  }

  @modelAction
  removeAndGetTrack(index: number) {
    const track = clone(this.tracks[index]);
    this.tracks.splice(index, 1);
    return track;
  }

  @modelAction
  moveTrack(oldIndex: number, newIndex: number) {
    const track = this.tracks[oldIndex];
    this.tracks.splice(oldIndex, 1);
    this.tracks.splice(newIndex, 0, track);
  }

  @modelAction
  clear() {
    this.tracks.length = 0;
  }

  @modelAction
  shuffel() {
    // https://www.frankmitchell.org/2015/01/fisher-yates/
    let i = 0;
    let j = 0;
    let temp = null;

    for (i = this.tracks.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = this.tracks[i];
      this.tracks[i] = this.tracks[j];
      this.tracks[j] = temp;
    }
  }
}
