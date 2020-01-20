import {
  model,
  Model,
  modelFlow,
  prop,
  Ref,
  _async,
  _await
} from "mobx-keystone";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import ApiClient from "../api/ApiClient";
import trackRef from "../references/TrackRef";
import Track from "./Track";
import Root from "../../containers/Root";

@model("Playlist")
export default class Playlist extends Model({
  id: prop<string>(),
  name: prop<string>(),
  tracks: prop<Ref<Track>[]>(),
  duration: prop(0),
  trackCount: prop(0)
}) {
  getTrackById(id: string) {
    if (!this.tracks) return null;
    return this.tracks.find(track => track.id === id);
  }

  getIndexOfTrack(track: Ref<Track>) {
    return this.tracks.map(t => t.id).indexOf(track.id);
  }

  getTracksStartingFrom(idx: number) {
    return this.tracks.slice(idx);
  }

  @modelFlow
  addTrack = _async(function*(this: Playlist, track: Track) {
    try {
      yield* _await(ApiClient.addTrackToPlaylist(this.id, track));

      this.trackCount = this.trackCount + 1;
      this.duration = this.duration + track.duration;
      this.tracks.push(trackRef(track));
    } catch (error) {
      AyeLogger.player(
        `Error adding track to playlist ${this.id} ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelFlow
  addLoadedTrack = _async(function*(this: Playlist, track: Track) {
    try {
      this.tracks.push(trackRef(track));
      if (this.tracks.length > this.trackCount) {
        this.trackCount = this.trackCount + 1;
        this.duration = this.duration + track.duration;
      }
    } catch (error) {
      AyeLogger.player(
        `Error adding track to playlist ${this.id} ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelFlow
  addTracksByUrls = _async(function*(this: Playlist, songs: { Url: string }[]) {
    try {
      // Add tracks to the playlist
      yield* _await(ApiClient.addTracksToPlaylistByUrls(this.id, songs));

      // get new Playlist information
      const pl = yield* _await(ApiClient.getPlaylist(this.id));

      // Get track information of the playlist
      const tracks = yield* _await(
        ApiClient.getTracksFromPlaylist(this.id, pl.SongsCount)
      );

      for (const track of tracks) {
        let tr = Root.stores.trackCache.getTrackById(track.Id);

        if (!tr) {
          tr = new Track({
            id: track.Id,
            title: track.Title,
            duration: track.Duration,
            isLivestream: false
          });
          Root.stores.trackCache.add(tr);
        }

        this.tracks.push(trackRef(tr));
      }

      this.duration = pl.Duration;
      this.trackCount = pl.SongsCount;
    } catch (error) {
      AyeLogger.player(
        `[addTracksByUrls] Error adding Tracks to playlist ${
          this.id
        } ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
    }
  });

  @modelFlow
  removeTrack = _async(function*(this: Playlist, track: Track) {
    try {
      yield* _await(ApiClient.removeTrackFromPlaylistById(this.id, track.id));

      const foundTrack = this.tracks.find(trk => trk.id === track.id);
      const idx = this.tracks.indexOf(foundTrack);

      this.trackCount = this.trackCount - 1;
      this.duration = this.duration - track.duration;
      this.tracks.splice(idx, 1);
    } catch (error) {
      AyeLogger.player(
        `Error remove track from playlist ${this.id} ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelFlow
  removeTrackById = _async(function*(this: Playlist, id: string) {
    try {
      yield* _await(ApiClient.removeTrackFromPlaylistById(this.id, id));

      const foundTrack = this.tracks.find(trk => trk.id === id);
      const idx = this.tracks.indexOf(foundTrack);

      this.trackCount = this.trackCount - 1;
      this.duration = this.duration - foundTrack.current.duration;
      this.tracks.splice(idx, 1);
    } catch (error) {
      AyeLogger.player(
        `Error remove track from playlist ${this.id} ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelFlow
  moveTrackTo = _async(function*(
    this: Playlist,
    oldIndex: number,
    newIndex: number
  ) {
    try {
      console.log("get track");
      const track = this.tracks[oldIndex].current;

      yield* _await(ApiClient.moveTrackTo(this.id, track.id, newIndex));

      console.log("REmove track");
      this.tracks.splice(oldIndex, 1);
      console.log("readd track");
      this.tracks.splice(newIndex, 0, trackRef(track));
      console.log("tracks", this.tracks);
    } catch (error) {
      AyeLogger.player(
        `Error changing Track order ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      throw error;
    }
  });
}
