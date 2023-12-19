export interface IRole {
  name: string;
}

export interface IUserInfoDto {
  avatar: string;
  email: string;
  username: string;
  roles: IRole[];
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
    },
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
    },
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
