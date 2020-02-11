//TODO: Move gql to unified endpoint !!!! erek
/**
 * Adjustments for GQL implementation
 * https://graphql.org/learn/best-practices/
 */

import ky from "ky/umd";
import Track from "../models/Track";
import { ITrackDto, IUserInfoDto, IPlaylistDto } from "../../types/response";
import {
  graphQLClientPlaylists,
  GRAPHQL,
  graphQLClientSearch
} from "./graphQL";
import {
  QueryPlaylist,
  CreatePlaylistInput,
  CreatePlaylistWithSongsInput,
  DeletePlaylistInput,
  QueryTracksFromPlaylist,
  AddTrackToPlaylistInput,
  AddTracksToPlaylistByUrlInput,
  SongInputType,
  RemoveTrackFromPlaylistInput,
  MoveTrackToInput,
  QuerySearchTrack,
  QueryTrackFromUrl,
  QueryRelatedTracks
} from "./graphQLTypes";

/**
 * Manages all requests to the aye-player backend
 */
class ApiClient {
  private ky: typeof ky;
  /**
   * Prepares our ky instance, also sets a beforeRequst hook
   * to check for an existing token and adding it as a header
   */
  constructor() {
    this.ky = ky.extend({
      prefixUrl: "https://api.aye-player.de/v1/",
      timeout: 5000,
      throwHttpErrors: true,
      hooks: {
        beforeRequest: [
          request => {
            const token = localStorage.getItem("token");

            if (token != null) {
              request.headers.set("x-access-token", token);
              request.headers.set("Authorization", `Bearer ${token}`);
            }
          }
        ]
      }
    });
  }

  /**
   * Retrieves all Playlists of the current user
   */
  async getPlaylists(): Promise<IPlaylistDto[]> {
    const {
      data: { Playlists }
    } = await graphQLClientPlaylists.query<any, any>({
      query: GRAPHQL.QUERY.PLAYLISTS
    });

    return Playlists;
  }

  /**
   * Retrieves a specific playlist of the current user
   * @param id id of the playlist
   */
  async getPlaylist(id: string): Promise<IPlaylistDto> {
    const {
      data: { Playlist }
    } = await graphQLClientPlaylists.query<any, QueryPlaylist>({
      query: GRAPHQL.QUERY.PLAYLIST,
      variables: {
        id
      }
    });

    return Playlist;
  }

  /**
   * Creates a new playlist
   * @param name name of the new playlist
   */
  async createPlaylist(name: string): Promise<string> {
    const {
      data: { CreateNewPlaylist }
    } = await graphQLClientPlaylists.mutate<any, CreatePlaylistInput>({
      mutation: GRAPHQL.MUTATION.CREATE_PLAYLIST,
      variables: {
        name
      }
    });

    return CreateNewPlaylist;
  }

  /**
   * Creates a new playlist and directly adds new songs to it
   * @param name Name of the new playlist
   * @param songs Urls of Songs which should be added to the inital playlist
   */
  // FIXME: adjust to work with gql
  async createPlaylistWithSongs(
    name: string,
    songs: SongInputType[]
  ): Promise<string> {
    const {
      data: { CreateNewPlaylistByVideoUrls }
    } = await graphQLClientPlaylists.mutate<any, CreatePlaylistWithSongsInput>({
      mutation: GRAPHQL.MUTATION.CREATE_PLAYLIST_WITH_SONGS,
      variables: {
        name,
        songs
      }
    });

    return CreateNewPlaylistByVideoUrls;
  }

  /**
   * Deletes given playlist
   * @param id id of the playlist
   */
  async deletePlaylist(id: string) {
    const {
      data: { DeletePlaylist }
    } = await graphQLClientPlaylists.mutate<any, DeletePlaylistInput>({
      mutation: GRAPHQL.MUTATION.DELETE_PLAYLIST,
      variables: {
        id
      }
    });

    return DeletePlaylist;
  }

  /**
   * Retrieves the given amount of Tracks of a playlist
   * @param id id of the playlist
   * @param amount amount of tracks to retrieve
   */
  async getTracksFromPlaylist(
    id: string,
    amount: number = 20,
    skip: number = 0
  ): Promise<ITrackDto[]> {
    const {
      data: { PlaylistSongs }
    } = await graphQLClientPlaylists.query<any, QueryTracksFromPlaylist>({
      query: GRAPHQL.QUERY.TRACKS_FROM_PLAYLIST,
      variables: {
        id,
        amount,
        skip
      }
    });

    return PlaylistSongs;
  }

  /**
   * Adds the given track to the playlist
   * @param id id of the playlist
   * @param track MobX cached Track
   */
  // FIXME: adjust to work with gql (in combination with spotify import)
  async addTrackToPlaylist(id: string, track: Track) {
    graphQLClientPlaylists.mutate<any, AddTrackToPlaylistInput>({
      mutation: GRAPHQL.MUTATION.ADD_TRACK_TO_PLAYLIST,
      variables: {
        id,
        trackId: track.id,
        title: track.title,
        duration: track.duration
      }
    });
  }

  /**
   * Adds given tracks to the playlist
   * @param id id of the playlist
   * @param songs array of youtube urls to be added to the playlist
   */
  async addTracksToPlaylistByUrls(id: string, songs: SongInputType[]) {
    graphQLClientPlaylists.mutate<any, AddTracksToPlaylistByUrlInput>({
      mutation: GRAPHQL.MUTATION.ADD_TRACKS_TO_PLAYLIST_BY_URLS,
      variables: {
        id,
        songs
      }
    });
  }

  /**
   * Deletes the given track from the playlist
   * @param id id of the playlist
   * @param track Mobx cached Track
   */
  async removeTrackFromPlaylist(id: string, track: Track) {
    graphQLClientPlaylists.mutate<any, RemoveTrackFromPlaylistInput>({
      mutation: GRAPHQL.MUTATION.REMOVE_TRACK_FROM_PLAYLIST,
      variables: {
        id,
        trackId: track.id
      }
    });
  }

  /**
   * Deletes given track from playlist by id
   * @param id id of the playlist
   * @param trackId id of the track
   */
  async removeTrackFromPlaylistById(id: string, trackId: string) {
    graphQLClientPlaylists.mutate<any, RemoveTrackFromPlaylistInput>({
      mutation: GRAPHQL.MUTATION.REMOVE_TRACK_FROM_PLAYLIST,
      variables: {
        id,
        trackId
      }
    });
  }

  /**
   * Moves a track from a playlist to a new position
   * @param id id of the playlist
   * @param trackId if of the track
   * @param index position to move to
   * @param oldIndex old position
   */
  async moveTrackTo(id: string, trackId: string, position: number) {
    graphQLClientPlaylists.mutate<any, MoveTrackToInput>({
      mutation: GRAPHQL.MUTATION.MOVE_TRACK_TO,
      variables: {
        id,
        trackId,
        position: position.toString()
      }
    });
  }

  /**
   * Registeres a new User
   * @param email email of the user
   * @param password password of the user
   */
  async register(username: string, email: string, password: string) {
    this.ky.post("userIdentity/", {
      json: {
        Email: email,
        Password: password,
        Username: username
      }
    });
  }

  /**
   * Tries to authenticate the given user with the given password
   * @param email email of the user
   * @param password password of the user
   */
  async authenticate(email: string, password: string): Promise<string> {
    return this.ky
      .post("auth/", {
        json: {
          Email: email,
          Password: password
        }
      })
      .json();
  }

  /**
   * Starts the forgot password process
   * @param email email of the account
   */
  async forgotPassword(email: string) {
    this.ky.put("userIdentity/password", {
      json: {
        Email: email
      }
    });
  }

  /**
   * Retrive the userdata of the logged in user
   */
  async getUserdata(): Promise<IUserInfoDto> {
    return this.ky.get("userIdentity/").json();
  }

  /**
   * Update the password of the logged in user
   * @param password new password
   */
  async updatePassword(password: string) {
    this.ky.patch("userIdentity/", {
      json: [
        {
          op: "replace",
          path: "/Password",
          value: password
        }
      ]
    });
  }

  /**
   * Updates (uploades) the avatar of the logged in user
   * @param data FormData containing the new avatar
   */
  async updateAvatar(data: FormData): Promise<string> {
    return this.ky
      .post("userIdentity/avatar", {
        body: data
      })
      .json();
  }

  /**
   * Updates the userprofile with the new avatar
   * @param url url of avatar
   */
  async updateAvatarUrl(url: string) {
    this.ky.patch("userIdentity/", {
      json: [
        {
          op: "replace",
          path: "/Avatar",
          value: url
        }
      ]
    });
  }

  /**
   * Deletes the logged in user
   */
  async deleteUser() {
    return this.ky.delete("userIdentity/");
  }

  /**
   * Retrieves videos from youtube for the given search term
   * @param term term to search youtube videos for
   */
  async searchTrack(term: string): Promise<ITrackDto[]> {
    const {
      data: { Songs }
    } = await graphQLClientSearch.query<any, QuerySearchTrack>({
      query: GRAPHQL.QUERY.SEARCH_TRACK,
      variables: {
        term
      }
    });

    return Songs;
  }

  /**
   * Resolves a youtube url to a video and retrives its information
   * @param url youtube url
   */
  async getTrackFromUrl(url: string): Promise<ITrackDto> {
    const {
      data: { Song }
    } = await graphQLClientSearch.query<any, QueryTrackFromUrl>({
      query: GRAPHQL.QUERY.TRACK_FROM_URL,
      variables: {
        url
      }
    });

    return Song;
  }

  /**
   * Retrives related videos for the given id
   * @param id youtube id
   */
  async getRelatedTracks(id: string): Promise<ITrackDto[]> {
    const {
      data: { Radio }
    } = await graphQLClientSearch.query<any, QueryRelatedTracks>({
      query: GRAPHQL.QUERY.RELATED_TRACKS,
      variables: {
        id
      }
    });

    return Radio;
  }
}

export default new ApiClient();
