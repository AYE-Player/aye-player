export interface ITrackDto {
  Id: string;
  Title: string;
  Duration: number;
  Source: string;
  IsLivestream: boolean;
}

export interface IPlaylistDto {
  Id: string;
  Name: string;
  Tracks?: ITrackDto[];
  Duration: number;
  SongsCount: number;
}

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
