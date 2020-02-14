export type Maybe<T> = T | null;
export type SongInputType = { Url: string };

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
  id: Scalars["ID"];
}

export interface QueryTracksFromPlaylist {
  id: Scalars["ID"];
  skip?: Maybe<Scalars["Float"]>;
  amount: Scalars["Float"];
}

export interface QuerySearchTrack {
  term: Scalars["String"];
}

export interface QueryTrackFromUrl {
  url: Scalars["String"];
}

export interface QueryRelatedTracks {
  id: Scalars["String"];
}

export interface CreatePlaylistInput {
  name: Scalars["String"];
}

export interface CreatePlaylistWithSongsInput {
  name: Scalars["String"];
  songs: SongInputType[];
}

export interface AddTracksToPlaylistByUrlInput {
  id: Scalars["ID"];
  songs: SongInputType[];
}

export interface DeletePlaylistInput {
  id: Scalars["ID"];
}

export interface AddTrackToPlaylistInput {
  id: Scalars["ID"];
  trackId: Scalars["String"];
  title: Scalars["String"];
  duration: Scalars["Int"];
}

export interface RemoveTrackFromPlaylistInput {
  id: Scalars["ID"];
  trackId: Scalars["String"];
}

export interface MoveTrackToInput {
  id: Scalars["ID"];
  trackId: Scalars["String"];
  position: Scalars["String"];
}
