import { types, Instance } from "mobx-state-tree";

export type TrackModel = Instance<typeof Track>;

const Track = types
  .model({
    id: types.string,
    title: types.string,
    duration: types.number,
    thumbnail: types.maybeNull(types.string)
  })
  .views(self => ({
    get getId() {
      return self.id;
    },
    get getName() {
      return self.title;
    },
    get getDuration() {
      return self.duration;
    },
    get formattedDuration() {
      const str_pad_left = (value: number, pad: string, length: number) => {
        return (new Array(length+1).join(pad)+value).slice(-length);
      }

      const hours = self.duration / 3600;
      const minutes = Math.floor(self.duration / 60);
      const seconds = self.duration - minutes * 60;
      const finalTime = (hours >= 1 ? str_pad_left(hours,'0',2)+':' : "")+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
      return finalTime;
    },
    get getThumbnail() {
      return self.thumbnail;
    },
    get getInfo() {
      return {
        id: self.id,
        title: self.title,
        duration: self.duration,
        thumbnail: self.thumbnail
      };
    }
  }))
  .actions(self => ({
    setId(id: string) {
      self.id = id;
    },

    settitle(title: string) {
      self.title = title;
    },

    setDuration(duration: number) {
      self.duration = duration;
    },

    setThumbnail(thumbnail: string) {
      self.thumbnail = thumbnail;
    },

    setInfo(id: string, title: string, duration: number, thumbnail: string) {
      self.id = id;
      self.title = title;
      self.duration = duration;
      self.thumbnail = thumbnail;
    }
  }));

export default Track;
