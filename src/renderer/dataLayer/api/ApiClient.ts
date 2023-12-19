/**
 * Adjustments for GQL implementation
 * https://graphql.org/learn/best-practices/
 */

import ky from 'ky';
import { IUserInfoDto } from '../../../types/response';
import Track from '../models/Track';
import {
  GRAPHQL,
  graphQLClientAuth,
  graphQLClientPlaylists,
  graphQLClientSearch,
  graphQLClientUserIdentity,
} from './graphQL';
import {
  AddTracksToPlaylistByUrlInput,
  AddTrackToPlaylistInput,
  CreatePlaylistByVideoUrls,
  CreatePlaylistInput,
  CreatePlaylistWithSongsInput,
  DeletePlaylistInput,
  GetTrackFromUrl,
  IPlaylistDto,
  ITrackDto,
  MoveTrackToInput,
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
  SongInput,
  ReplaceTrackInput,
  RegisterAccountInput,
  CreateTokenInput,
  Token,
  UpdatePassword,
  User,
  ForgotPasswordInput,
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
      data: { playlists },
    } = await graphQLClientPlaylists.query<PlaylistsData, any>({
      query: GRAPHQL.QUERY.PLAYLISTS,
    });

    return playlists;
  };

  /**
   * Retrieves a specific playlist
   * @param id id of the playlist
   */
  getPlaylist = async (id: string): Promise<IPlaylistDto> => {
    const { data } = await graphQLClientPlaylists.query<
      IPlaylistDto,
      QueryPlaylist
    >({
      query: GRAPHQL.QUERY.PLAYLIST,
      variables: {
        id,
      },
    });

    return data;
  };

  /**
   * Creates a new playlist
   * @param name name of the new playlist
   */
  createPlaylist = async (name: string): Promise<IPlaylistDto> => {
    const { data } = await graphQLClientPlaylists.mutate<
      { createPlaylist: IPlaylistDto },
      CreatePlaylistInput
    >({
      mutation: GRAPHQL.MUTATION.CREATE_PLAYLIST,
      variables: {
        name,
      },
    });

    return data!.createPlaylist;
  };

  /**
   * Creates a new playlist and directly adds new songs to it
   * @param name Name of the new playlist
   * @param songs Urls of Songs which should be added to the inital playlist
   */
  createPlaylistWithSongs = async (
    name: string,
    songs: SongInput[],
  ): Promise<IPlaylistDto> => {
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

    return data!.createPlaylistByVideoUrls;
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
    skip = 0,
  ): Promise<ITrackDto[]> => {
    const {
      data: { playlistSongs },
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

    return playlistSongs;
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
  addTracksToPlaylistByUrls = async (id: string, songs: SongInput[]) => {
    const { data } = await graphQLClientPlaylists.mutate<
      { addSongsToPlaylistByUrls: IPlaylistDto },
      AddTracksToPlaylistByUrlInput
    >({
      mutation: GRAPHQL.MUTATION.ADD_TRACKS_TO_PLAYLIST_BY_URLS,
      variables: {
        id,
        songs,
      },
    });

    return data!.addSongsToPlaylistByUrls;
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
   * Registers a new User
   * @param email email of the user
   * @param password password of the user
   */
  register = async (
    username: string,
    email: string,
    password: string,
    inviteCode?: string,
  ) => {
    return graphQLClientUserIdentity.mutate<void, RegisterAccountInput>({
      mutation: GRAPHQL.MUTATION.REGISTER_ACCOUNT,
      variables: {
        username,
        email,
        password,
        inviteCode,
      },
    });
  };

  /**
   * Tries to authenticate the given user with the given password
   * @param email email of the user
   * @param password password of the user
   */
  authenticate = async (email: string, password: string): Promise<string> => {
    const { data } = await graphQLClientAuth.mutate<Token, CreateTokenInput>({
      mutation: GRAPHQL.MUTATION.CREATE_TOKEN,
      variables: {
        email,
        password,
      },
    });

    return data!.createToken;
  };

  /**
   * Starts the forgot password process
   * @param email email of the account
   */
  forgotPassword = async (email: string) => {
    await graphQLClientUserIdentity.mutate<void, ForgotPasswordInput>({
      mutation: GRAPHQL.MUTATION.FORGOT_PASSWORD,
      variables: {
        email,
      },
    });
  };

  /**
   * Retrieve the userdata of the logged in user
   */
  getUserdata = async (): Promise<IUserInfoDto> => {
    const {
      data: { getSelf },
    } = await graphQLClientUserIdentity.query<{ getSelf: User }>({
      query: GRAPHQL.QUERY.GET_SELF,
    });

    return getSelf;
  };

  /**
   * Update the password of the logged in user
   * @param password new password
   */
  updatePassword = async (oldPassword: string, newPassword: string) => {
    await graphQLClientUserIdentity.mutate<void, UpdatePassword>({
      mutation: GRAPHQL.MUTATION.UPDATE_PASSWORD,
      variables: {
        newPassword,
        oldPassword,
      },
    });
  };

  /**
   * Updates (uploads) the avatar of the logged in user
   * @param data FormData containing the new avatar
   */
  updateAvatar = async (data: FormData): Promise<{ avatar: string }> => {
    return this.ky
      .post('useridentity/avatar', {
        body: data,
      })
      .json();
  };

  /**
   * Deletes the logged in user
   */
  deleteUser = async () => {
    graphQLClientUserIdentity.mutate<void>({
      mutation: GRAPHQL.MUTATION.DELETE_SELF,
    });
  };

  /**
   * Retrieves videos from youtube for the given search term
   * @param term term to search youtube videos for
   */
  searchTrack = async (term: string): Promise<ITrackDto[]> => {
    const {
      data: { songs },
    } = await graphQLClientSearch.query<SearchTracks, QuerySearchTrack>({
      query: GRAPHQL.QUERY.SEARCH_TRACK,
      variables: {
        term,
      },
    });

    return songs;
  };

  /**
   * Resolves a youtube url to a video and retrieves its information
   * @param url youtube url
   */
  getTrackFromUrl = async (url: string): Promise<ITrackDto> => {
    const {
      data: { song },
    } = await graphQLClientSearch.query<GetTrackFromUrl, QueryTrackFromUrl>({
      query: GRAPHQL.QUERY.TRACK_FROM_URL,
      variables: {
        url,
      },
    });

    return song;
  };

  /**
   * Retrieves related tracks for the given id
   * @param id youtube id
   */
  getRelatedTracks = async (id: string): Promise<ITrackDto[]> => {
    const {
      data: { radio },
    } = await graphQLClientSearch.query<RelatedTracks, QueryRelatedTracks>({
      query: GRAPHQL.QUERY.RELATED_TRACKS,
      variables: {
        id,
      },
    });

    return radio;
  };

  /**
   * Replaces a deleted Song with a new one
   * @param oldTrack old track
   * @param newTrack new track
   */
  replaceSong = async (
    oldTrack: ITrackDto,
    newTrack: ITrackDto,
  ): Promise<void> => {
    await graphQLClientPlaylists.mutate<void, ReplaceTrackInput>({
      mutation: GRAPHQL.MUTATION.REPLACE_TRACK,
      variables: {
        oldSong: oldTrack,
        newSong: newTrack,
      },
    });
  };

  /**
   * Generate an invite code
   * @returns invite code
   */
  generateInviteCode = async (): Promise<string> => {
    const { data } = await graphQLClientUserIdentity.mutate<{
      generateInviteCode: string;
    }>({
      mutation: GRAPHQL.MUTATION.GENERATE_INVITE_CODE,
    });

    return data!.generateInviteCode;
  };
}

export default new ApiClient();
