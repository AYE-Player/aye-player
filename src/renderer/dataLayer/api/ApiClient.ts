/**
 * Adjustments for GQL implementation
 * https://graphql.org/learn/best-practices/
 */

import ky from 'ky';
import { IUserInfoDto } from '../../../types/response';
import Track from '../models/Track';
import {
  GRAPHQL,
  graphQLClientPlaylists,
  graphQLClientSearch,
} from './graphQL';
import {
  AddTracksToPlaylistByUrlInput,
  AddTrackToPlaylistInput,
  CreatePlaylistByVideoUrls,
  CreatePlaylistData,
  CreatePlaylistInput,
  CreatePlaylistWithSongsInput,
  DeletePlaylistInput,
  GetTrackFromUrl,
  IPlaylistDto,
  ITrackDto,
  MoveTrackToInput,
  PlaylistData,
  PlaylistsData,
  PlaylistTracks,
  QueryPlaylist,
  QueryRelatedTracks,
  QuerySearchTrack,
  QueryTrackFromUrl,
  QueryTracksFromPlaylist,
  RelatedTracks,
  RemoveTrackFromPlaylistInput,
  SearchTracks,
  SongInputType,
  SubscribePlaylistInpt,
  UnsubscribePlaylistInpt,
  ReplaceTrackInput,
} from './graphQLTypes';

/**
 * Manages all requests to the aye-player backend
 */
class ApiClient {
  private ky: typeof ky;

  /**
   * Prepares our ky instance, also sets a beforeRequst hook
   * to check for an existing token and adds it as a header
   */
  constructor() {
    this.ky = ky.extend({
      prefixUrl: 'https://api.aye-playr.de/v1/',
      timeout: 5000,
      throwHttpErrors: true,
      hooks: {
        beforeRequest: [
          (request) => {
            const token = localStorage.getItem('token');

            if (token != null) {
              request.headers.set('x-access-token', token);
              request.headers.set('Authorization', `Bearer ${token}`);
            }
          },
        ],
      },
    });
  }

  /**
   * Retrieves all Playlists
   */
  getPlaylists = async (): Promise<IPlaylistDto[]> => {
    const {
      data: { Playlists },
    } = await graphQLClientPlaylists.query<PlaylistsData, any>({
      query: GRAPHQL.QUERY.PLAYLISTS,
    });

    return Playlists;
  };

  /**
   * Retrieves a specific playlist
   * @param id id of the playlist
   */
  getPlaylist = async (id: string): Promise<IPlaylistDto> => {
    const {
      data: { Playlist },
    } = await graphQLClientPlaylists.query<PlaylistData, QueryPlaylist>({
      query: GRAPHQL.QUERY.PLAYLIST,
      variables: {
        id,
      },
    });

    return Playlist;
  };

  /**
   * Creates a new playlist
   * @param name name of the new playlist
   */
  createPlaylist = async (name: string): Promise<string> => {
    const { data } = await graphQLClientPlaylists.mutate<
      CreatePlaylistData,
      CreatePlaylistInput
    >({
      mutation: GRAPHQL.MUTATION.CREATE_PLAYLIST,
      variables: {
        name,
      },
    });

    if (data) {
      return data.CreateNewPlaylist.Id;
    }
    return '';
  };

  /**
   * Creates a new playlist and directly adds new songs to it
   * @param name Name of the new playlist
   * @param songs Urls of Songs which should be added to the inital playlist
   */
  createPlaylistWithSongs = async (
    name: string,
    songs: SongInputType[]
  ): Promise<string> => {
    const { data } = await graphQLClientPlaylists.mutate<
      CreatePlaylistByVideoUrls,
      CreatePlaylistWithSongsInput
    >({
      mutation: GRAPHQL.MUTATION.CREATE_PLAYLIST_WITH_SONGS,
      variables: {
        name,
        songs,
      },
    });

    if (data) {
      return data.CreateNewPlaylistByVideoUrls.Id;
    }
    return '';
  };

  /**
   * Deletes given playlist
   * @param id id of the playlist
   */
  deletePlaylist = async (id: string) => {
    graphQLClientPlaylists.mutate<void, DeletePlaylistInput>({
      mutation: GRAPHQL.MUTATION.DELETE_PLAYLIST,
      variables: {
        id,
      },
    });
  };

  /**
   * Retrieves the given amount of Tracks of a playlist
   * @param id id of the playlist
   * @param amount amount of tracks to retrieve
   * @param skip amount of tracks to skip
   */
  getTracksFromPlaylist = async (
    id: string,
    amount = 20,
    skip = 0
  ): Promise<ITrackDto[]> => {
    const {
      data: { PlaylistSongs },
    } = await graphQLClientPlaylists.query<
      PlaylistTracks,
      QueryTracksFromPlaylist
    >({
      query: GRAPHQL.QUERY.TRACKS_FROM_PLAYLIST,
      variables: {
        id,
        amount,
        skip,
      },
    });

    return PlaylistSongs;
  };

  /**
   * Adds the given track to the playlist
   * @param id id of the playlist
   * @param track MobX cached Track
   */
  addTrackToPlaylist = async (id: string, track: Track) => {
    graphQLClientPlaylists.mutate<void, AddTrackToPlaylistInput>({
      mutation: GRAPHQL.MUTATION.ADD_TRACK_TO_PLAYLIST,
      variables: {
        id,
        trackId: track.id,
        title: track.title,
        duration: track.duration,
      },
    });
  };

  /**
   * Adds given tracks to the playlist
   * @param id id of the playlist
   * @param songs array of youtube urls to be added to the playlist
   */
  addTracksToPlaylistByUrls = async (id: string, songs: SongInputType[]) => {
    graphQLClientPlaylists.mutate<void, AddTracksToPlaylistByUrlInput>({
      mutation: GRAPHQL.MUTATION.ADD_TRACKS_TO_PLAYLIST_BY_URLS,
      variables: {
        id,
        songs,
      },
    });
  };

  /**
   * Deletes the given track from the playlist
   * @param id id of the playlist
   * @param track Mobx cached Track
   */
  removeTrackFromPlaylist = async (id: string, track: Track) => {
    graphQLClientPlaylists.mutate<void, RemoveTrackFromPlaylistInput>({
      mutation: GRAPHQL.MUTATION.REMOVE_TRACK_FROM_PLAYLIST,
      variables: {
        id,
        trackId: track.id,
      },
    });
  };

  /**
   * Deletes given track from playlist by id
   * @param id id of the playlist
   * @param trackId id of the track
   */
  removeTrackFromPlaylistById = async (id: string, trackId: string) => {
    graphQLClientPlaylists.mutate<void, RemoveTrackFromPlaylistInput>({
      mutation: GRAPHQL.MUTATION.REMOVE_TRACK_FROM_PLAYLIST,
      variables: {
        id,
        trackId,
      },
    });
  };

  /**
   * Moves a track from a playlist to a new position
   * @param id id of the playlist
   * @param trackId if of the track
   * @param position position to move to
   */
  moveTrackTo = async (id: string, trackId: string, position: number) => {
    graphQLClientPlaylists.mutate<void, MoveTrackToInput>({
      mutation: GRAPHQL.MUTATION.MOVE_TRACK_TO,
      variables: {
        id,
        trackId,
        position: position.toString(),
      },
    });
  };

  /**
   * Subscribe to the given Playlist
   * @param id id of the playlist
   */
  subscribePlaylist = async (id: string) => {
    graphQLClientPlaylists.mutate<void, SubscribePlaylistInpt>({
      mutation: GRAPHQL.MUTATION.SUBSCRIBE_PLAYLIST,
      variables: {
        id,
      },
    });
  };

  /**
   * Unsubscribe from the given Playlist
   * @param id id of the playlist
   */
  unsubscribePlaylist = async (id: string) => {
    graphQLClientPlaylists.mutate<void, UnsubscribePlaylistInpt>({
      mutation: GRAPHQL.MUTATION.UNSUBSCRIBE_PLAYLIST,
      variables: {
        id,
      },
    });
  };

  /**
   * Registers a new User
   * @param email email of the user
   * @param password password of the user
   */
  register = async (username: string, email: string, password: string) => {
    this.ky.post('userIdentity/', {
      json: {
        Email: email,
        Password: password,
        Username: username,
      },
    });
  };

  /**
   * Tries to authenticate the given user with the given password
   * @param email email of the user
   * @param password password of the user
   */
  authenticate = async (email: string, password: string): Promise<string> => {
    return this.ky
      .post('auth/', {
        json: {
          Email: email,
          Password: password,
        },
      })
      .json();
  };

  /**
   * Starts the forgot password process
   * @param email email of the account
   */
  forgotPassword = async (email: string) => {
    this.ky.put('userIdentity/password', {
      json: {
        Email: email,
      },
    });
  };

  /**
   * Retrieve the userdata of the logged in user
   */
  getUserdata = async (): Promise<IUserInfoDto> => {
    return this.ky.get('userIdentity/').json();
  };

  /**
   * Update the password of the logged in user
   * @param password new password
   */
  updatePassword = async (password: string) => {
    this.ky.patch('userIdentity/', {
      json: [
        {
          op: 'replace',
          path: '/Password',
          value: password,
        },
      ],
    });
  };

  /**
   * Updates (uploads) the avatar of the logged in user
   * @param data FormData containing the new avatar
   */
  updateAvatar = async (data: FormData): Promise<string> => {
    return this.ky
      .post('userIdentity/avatar', {
        body: data,
      })
      .json();
  };

  /**
   * Updates the userprofile with the new avatar
   * @param url url of avatar
   */
  updateAvatarUrl = async (url: string) => {
    this.ky.patch('userIdentity/', {
      json: [
        {
          op: 'replace',
          path: '/Avatar',
          value: url,
        },
      ],
    });
  };

  /**
   * Deletes the logged in user
   */
  deleteUser = async () => {
    return this.ky.delete('userIdentity/');
  };

  /**
   * Retrieves videos from youtube for the given search term
   * @param term term to search youtube videos for
   */
  searchTrack = async (term: string): Promise<ITrackDto[]> => {
    const {
      data: { Songs },
    } = await graphQLClientSearch.query<SearchTracks, QuerySearchTrack>({
      query: GRAPHQL.QUERY.SEARCH_TRACK,
      variables: {
        term,
      },
    });

    return Songs;
  };

  /**
   * Resolves a youtube url to a video and retrieves its information
   * @param url youtube url
   */
  getTrackFromUrl = async (url: string): Promise<ITrackDto> => {
    const {
      data: { Song },
    } = await graphQLClientSearch.query<GetTrackFromUrl, QueryTrackFromUrl>({
      query: GRAPHQL.QUERY.TRACK_FROM_URL,
      variables: {
        url,
      },
    });

    return Song;
  };

  /**
   * Retrieves related tracks for the given id
   * @param id youtube id
   */
  getRelatedTracks = async (id: string): Promise<ITrackDto[]> => {
    const {
      data: { Radio },
    } = await graphQLClientSearch.query<RelatedTracks, QueryRelatedTracks>({
      query: GRAPHQL.QUERY.RELATED_TRACKS,
      variables: {
        id,
      },
    });

    return Radio;
  };

  /**
   * Replaces a deleted Song with a new one
   * @param oldTrack old track
   * @param newTrack new track
   */
  replaceSong = async (
    oldTrack: ITrackDto,
    newTrack: ITrackDto
  ): Promise<void> => {
    await graphQLClientPlaylists.mutate<void, ReplaceTrackInput>({
      mutation: GRAPHQL.MUTATION.REPLACE_TRACK,
      variables: {
        oldSong: oldTrack,
        newSong: newTrack,
      },
    });
  };
}

export default new ApiClient();
