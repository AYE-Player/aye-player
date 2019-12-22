import { detach, rootRef } from "mobx-keystone";
import Track from "../models/Track";

const trackRef = rootRef<Track>("TrackRef", {
  getId(maybeTrack) {
    return maybeTrack instanceof Track ? maybeTrack.id : undefined;
  },

  onResolvedValueChange(ref, newTrack, oldTrack) {
    if (oldTrack && !newTrack) {
      detach(ref);
    }
  }
});

export default trackRef;
