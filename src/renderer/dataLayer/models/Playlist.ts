import {
  getRoot,
  idProp,
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  Ref,
  _async,
  _await,
} from 'mobx-keystone';
import trackRef from '../references/TrackRef';
import RootStore from '../stores/RootStore';
import Track from './Track';
import {
  addTrackToPlaylist,
  addTracksToPlaylistByUrls,
  getTracksFromPlaylist,
  removeTrackFromPlaylistById,
  moveTrackTo,
  replaceSong,
} from '../api/fetchers';

@model('Playlist')
class Playlist extends Model({
  id: idProp,
  name: prop<string>(),
  tracks: prop<Ref<Track>[]>(),
  duration: prop(0),
  trackCount: prop(0),
}) {
  getTrackById(id: string) {
    if (!this.tracks) return null;
    return this.tracks.find((track) => track.current.id === id);
  }

  getIndexOfTrack(track: Ref<Track>) {
    return this.tracks.findIndex((t) => t.current.id === track.current.id);
  }

  getTracksStartingFrom(idx: number) {
    return this.tracks.slice(idx);
  }

  @modelFlow
  addTrack = _async(function* (this: Playlist, track: Track) {
    yield* _await(addTrackToPlaylist(this.id, track));

    this.trackCount += 1;
    this.duration += track.duration;
    this.tracks.push(trackRef(track));
  });

  @modelAction
  addLoadedTrack(track: Track) {
    this.tracks.push(trackRef(track));
    if (this.tracks.length > this.trackCount) {
      this.trackCount += 1;
      this.duration += track.duration;
    }
  }

  @modelFlow
  addTracksByUrls = _async(function* (
    this: Playlist,
    songs: { url: string }[],
  ) {
    // Add tracks to the playlist
    const pl = yield* _await(addTracksToPlaylistByUrls(this.id, songs));

    // Get track information of the playlist
    const tracks = yield* _await(getTracksFromPlaylist(this.id));

    const { trackCache } = getRoot<RootStore>(this);
    for (const track of tracks) {
      let tr = trackCache.getTrackById(track.id);

      if (!tr) {
        tr = new Track({
          id: track.id,
          title: track.title,
          duration: track.duration,
          isLivestream: false,
        });
        trackCache.add(tr);
      }

      if (!this.getTrackById(tr.id)) {
        this.tracks.push(trackRef(tr));
      }
    }

    this.duration = pl.duration;
    this.trackCount = pl.songCount;
  });

  @modelFlow
  removeTrackById = _async(function* (this: Playlist, id: string) {
    yield* _await(removeTrackFromPlaylistById(this.id, id));

    const idx = this.tracks.findIndex((trk) => trk.current.id === id);

    this.trackCount -= 1;
    this.duration -= this.tracks[idx].current.duration;
    this.tracks.splice(idx, 1);
  });

  @modelFlow
  moveTrackTo = _async(function* (
    this: Playlist,
    oldIndex: number,
    newIndex: number,
  ) {
    const track = this.tracks[oldIndex].current;

    this.tracks.splice(oldIndex, 1);
    this.tracks.splice(newIndex, 0, trackRef(track));

    yield* _await(moveTrackTo(this.id, track.id, newIndex));
  });

  @modelFlow
  replaceTrack = _async(function* (
    this: Playlist,
    oldTrack: Ref<Track>,
    newTrack: Track,
  ) {
    yield* _await(
      replaceSong(
        {
          id: oldTrack.current.id,
          title: oldTrack.current.title,
          duration: oldTrack.current.duration,
        },
        {
          id: newTrack.id,
          title: newTrack.title,
          duration: newTrack.duration,
        },
      ),
    );

    this.tracks.splice(
      this.tracks.findIndex(
        (track) => track.current.id === oldTrack.current.id,
      ),
      1,
      trackRef(newTrack),
    );
  });

  @modelFlow
  getTracks = _async(function* (this: Playlist) {
    const { trackCache } = getRoot<RootStore>(this);

    const tracks = yield* _await(getTracksFromPlaylist(this.id));

    for (const track of tracks) {
      const tr = new Track({
        id: track.id,
        duration: track.duration,
        title: track.title,
      });
      if (!trackCache.tracks.find((tra) => tra.id === tr.id)) {
        trackCache.add(tr);
      }
      if (!this.getTrackById(tr.id)) {
        this.addLoadedTrack(tr);
      }
    }
  });
}

export default Playlist;
