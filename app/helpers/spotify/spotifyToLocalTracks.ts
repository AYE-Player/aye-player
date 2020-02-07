import { searchYoutube, timestringToSeconds } from "..";

const spotifyToLocalTracks = async (playlist: any) => {
  const tracks = playlist
    .tracks.items.map(
      (item: any) =>
        `${item.track.name} ${item.track.artists
          .map((artist: any) => artist.name)
          .join(" ")}`
    );

  return Promise.all(
    tracks.map(async (track: any) => await searchYoutube(track))
  ).then(res =>
    res.map((r: any) => {
      return {
        id: r.items[0].link.split("watch?v=")[1],
        title: r.items[0].title,
        duration: timestringToSeconds(r.items[0].duration)
      };
    })
  );
};

export default spotifyToLocalTracks;
