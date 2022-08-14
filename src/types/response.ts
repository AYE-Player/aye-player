export interface IRole {
  Id: string;
  Name: string;
}

export interface IUserInfoDto {
  Id: string;
  Avatar: string;
  Email: string;
  Username: string;
  Roles: IRole[];
}

interface IListenMoeArtist {
  id: number;
  name: string;
  nameRomaji: string | null;
  image: string;
}

interface IListenMoeSong {
  id: number;
  title: string;
  sources: any[];
  artists: IListenMoeArtist[];
  albums: IListenMoeAlbum[];
  duration: number;
  favorite: boolean;
}

interface IListenMoeRequester {
  name: string;
}

interface IListenMoeEvent {
  name: string;
  image: string;
}

interface IListenMoeData {
  song: IListenMoeSong;
  requester: IListenMoeRequester | null;
  event: IListenMoeEvent | null;
  startTime: string;
  lastPlayed: IListenMoeSong[];
  listeners: number;
  heartbeat: number;
}

export interface IListenMoeSongUpdate {
  op: number;
  d: IListenMoeData;
  t: string;
}

interface IListenMoeAlbum {
  id: number;
  name: string;
  nameRomaji: string;
  image: string;
  releaseDate: string;
}

interface IListenMoeUploader {
  uuid: string;
  username: string;
  displayName: string;
}

interface IListenMoeFavorite {
  albums: IListenMoeAlbum;
  artists: IListenMoeArtist[];
  duration: number;
  groups: any[];
  id: number;
  lastPLayed: string;
  notes: string;
  source: any[];
  tags: any[];
  title: string;
  uploader: IListenMoeUploader;
}

export interface IListenMoeFavorites {
  message: string;
  favorites: IListenMoeFavorite[];
}

export interface IDiscordActivity {
  playbackPosition: number;
  startTimestamp: number;
  endTimestamp: number;
  state: string | null;
  details: string;
  duration: number;
}

export interface ISpotifyArtist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: [
    {
      url: string;
      height: number;
      width: number;
    }
  ];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export interface ISpotifyTrack {
  name: string;
  artists: ISpotifyArtist[];
}

export interface ISpotifyPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: [
    {
      url: string;
      height: number;
      width: number;
    }
  ];
  name: string;
  owner: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string;
      total: number;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
    display_name: string;
  };
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    items: ISpotifyTrack[];
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
  };
  type: string;
  uri: string;
}

export interface ISpotifyPlaylists {
  href: string;
  items: ISpotifyPlaylist[];
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
}
