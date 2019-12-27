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
  Tracks: ITrackDto[];
  Duration: number;
  SongsCount: number;
}
