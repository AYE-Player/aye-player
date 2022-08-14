import { ISpotifyPlaylist, ISpotifyPlaylists } from 'types/response';

const loadPlaylists = async (
  accessToken: string
): Promise<ISpotifyPlaylist[]> => {
  const rawPlaylists: ISpotifyPlaylists = await fetch(
    `https://api.spotify.com/v1/me/playlists?limit=50`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((res) => res.json());

  if (rawPlaylists == null) Error('failed to retrieve playlists');

  const fetchPromises = [];

  for (const item of rawPlaylists.items) {
    fetchPromises.push(
      fetch(item.href, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((res) => res.json())
    );
  }

  const playlists: ISpotifyPlaylist[] = await Promise.all(fetchPromises);

  return playlists;
};

export default loadPlaylists;
