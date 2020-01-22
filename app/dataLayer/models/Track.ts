import { model, Model, modelAction, prop } from "mobx-keystone";

@model("Track")
export default class Track extends Model({
  id: prop<string>(),
  title: prop<string>(),
  source: prop("youtube"),
  duration: prop(0),
  isLivestream: prop(false)
}) {
  getRefId() {
    return this.id;
  }

  get formattedDuration() {
    const str_pad_left = (value: number, pad: string, length: number) => {
      return (new Array(length + 1).join(pad) + value).slice(-length);
    };

    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration - hours * 3600) / 60);
    const seconds = this.duration - minutes * 60;

    return (
      (hours >= 1 ? str_pad_left(hours, "0", 2) + ":" : "") +
      str_pad_left(minutes, "0", 2) +
      ":" +
      str_pad_left(seconds, "0", 2)
    );
  }

  @modelAction
  setDuration(duration: number) {
    this.duration = duration;
  }
}
