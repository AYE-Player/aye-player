export interface ITrackDto {
  Id: string;
  Title: string;
  Duration: number;
  Source: string;
}

export interface IPlaylistDto {
  Id: string;
  Name: string;
  Tracks: ITrackDto[];
}
