export type Maybe<T> = T | null;
export type SongInput = { url: string };
export type ResolvedSong = { id: string; title: string; duration: number };

/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  timestamptz: string;
  uuid: string;
  _text: string[];
  jsonb: string;
}

export interface QueryPlaylist {
  id: Scalars['ID'];
}

export interface QueryTracksFromPlaylist {
  id: Scalars['ID'];
  skip?: Maybe<Scalars['Int']>;
  amount: Scalars['Int'];
}

export interface QuerySearchTrack {
  term: Scalars['String'];
}

export interface QueryTrackFromUrl {
  url: Scalars['String'];
}

export interface QueryRelatedTracks {
  id: Scalars['String'];
}

export interface CreatePlaylistInput {
  name: Scalars['String'];
}

export interface CreatePlaylistWithSongsInput {
  name: Scalars['String'];
  songs: SongInput[];
}

export interface AddTracksToPlaylistByUrlInput {
  id: Scalars['ID'];
  songs: SongInput[];
}

export interface DeletePlaylistInput {
  id: Scalars['ID'];
}

export interface AddTrackToPlaylistInput {
  id: Scalars['ID'];
  trackId: Scalars['String'];
  title: Scalars['String'];
  duration: Scalars['Int'];
}

export interface RemoveTrackFromPlaylistInput {
  id: Scalars['ID'];
  trackId: Scalars['String'];
}

export interface ReplaceTrackInput {
  oldSong: {
    id: Scalars['ID'];
    title: Scalars['String'];
    duration: Scalars['Int'];
  };
  newSong: {
    id: Scalars['ID'];
    title: Scalars['String'];
    duration: Scalars['Int'];
  };
}

export interface MoveTrackToInput {
  playlistId: Scalars['ID'];
  trackId: Scalars['ID'];
  position: Scalars['Int'];
}

export interface SubscribePlaylistInpt {
  id: Scalars['ID'];
}

export interface UnsubscribePlaylistInpt {
  id: Scalars['ID'];
}

export interface RegisterAccountInput {
  username: Scalars['String'];
  password: Scalars['String'];
  email: Scalars['String'];
  inviteCode?: Scalars['String'];
}

export interface CreateTokenInput {
  email: Scalars['String'];
  password: Scalars['String'];
}

export interface UpdatePassword {
  oldPassword: Scalars['String'];
  newPassword: Scalars['String'];
}

export interface GetUserDataInput {
  id: Scalars['String'];
}

export interface ForgotPasswordInput {
  email: Scalars['String'];
}

// Return types
export interface IPlaylistDto {
  id: Scalars['String'];
  name: Scalars['String'];
  duration: Scalars['Int'];
  songs?: ITrackDto[];
  songCount: Scalars['Int'];
}

export interface ITrackDto {
  id: Scalars['ID'];
  title: Scalars['String'];
  duration: Scalars['Int'];
}

export interface PlaylistsData {
  playlists: IPlaylistDto[];
}

export interface CreatePlaylist {
  id: Scalars['String'];
}

export interface CreatePlaylistResponse {
  playlist: IPlaylistDto;
}

export interface CreatePlaylistByVideoUrls {
  createPlaylistByVideoUrls: IPlaylistDto;
}

export interface PlaylistTracks {
  playlistSongs: ITrackDto[];
}

export interface SearchTracks {
  songs: ITrackDto[];
}

export interface RelatedTracks {
  radio: ITrackDto[];
}

export interface GetTrackFromUrl {
  song: ITrackDto;
}

export interface Token {
  createToken: Scalars['String'];
}

export interface IRole {
  name: Scalars['String'];
}

export interface User {
  id: Scalars['ID'];
  username: Scalars['String'];
  email: Scalars['String'];
  avatar: Scalars['String'];
  roles: IRole[];
}
