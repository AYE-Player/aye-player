import { ISpotifyPlaylist, ISpotifyTrack } from 'types/response';
import ytsr from 'ytsr';
import { timestringToSeconds } from '..';

const spotifyPlaylistToLocalTracks = async (playlist: ISpotifyPlaylist) => {
  const tracks = playlist.tracks.items.map(
    (item: ISpotifyTrack) =>
      `${item.name} ${item.artists.map((artist) => artist.name).join(' ')}`
  );

  return Promise.all(
    tracks.map(async (track) => window.electron.youtube.search(track))
  ).then((res) =>
    res.map((r) => {
      return {
        id: (r.items[0] as ytsr.Video).url.split('watch?v=')[1],
        title: (r.items[0] as ytsr.Video).title,
        duration: timestringToSeconds(
          (r.items[0] as ytsr.Video).duration || '0'
        ),
      };
    })
  );
};

export default spotifyPlaylistToLocalTracks;
