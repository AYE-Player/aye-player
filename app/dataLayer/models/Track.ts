import { types } from "mobx-state-tree";

export type TrackModel = typeof Track.Type;

const Track = types
  .model({
    id: types.identifier,
    title: types.string,
    duration: types.optional(types.number, 0),
    isLivestream: types.optional(types.boolean, false)
  })
  .named("Track")
  .views(self => ({
    get formattedDuration() {
      const str_pad_left = (value: number, pad: string, length: number) => {
        return (new Array(length + 1).join(pad) + value).slice(-length);
      };

      const hours = Math.floor(self.duration / 3600);
      const minutes = Math.floor((self.duration - hours * 3600) / 60);
      const seconds = self.duration - minutes * 60;

      const finalTime =
        (hours >= 1 ? str_pad_left(hours, "0", 2) + ":" : "") +
        str_pad_left(minutes, "0", 2) +
        ":" +
        str_pad_left(seconds, "0", 2);
      return finalTime;
    }
  }))
  .actions(self => ({
    setDuration(duration: number) {
      self.duration = Math.trunc(duration);
    }
  }));

export default Track;
