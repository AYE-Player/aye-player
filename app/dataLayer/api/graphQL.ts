import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink, concat } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token") || null;
  //add authorization header
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : null,
    },
  });

  return forward(operation);
});

const authMiddlewareListenMoe = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("listenMoe_token") || null;
  //add authorization header
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : null,
    },
  });

  return forward(operation);
});

export const graphQLClientPlaylists = new ApolloClient({
  cache: new InMemoryCache(),
  connectToDevTools: true,
  link: concat(
    authMiddleware,
    new HttpLink({
      uri: "https://api.aye-playr.de/v1/playlists/gql",
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
    mutate: {
      fetchPolicy: "no-cache",
    },
  },
});

export const graphQLClientSearch = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(
    authMiddleware,
    new HttpLink({
      uri: "https://api.aye-playr.de/v1/search/gql",
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
    mutate: {
      fetchPolicy: "no-cache",
    },
  },
});

export const graphQLListenMoe = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(
    authMiddlewareListenMoe,
    new HttpLink({
      uri: "https://listen.moe/graphql",
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
    mutate: {
      fetchPolicy: "no-cache",
    },
  },
});

export const GRAPHQL = {
  ENDPOINT: "https://api.aye-playr.de/v1/playlists/gql",

  QUERY: {
    PLAYLISTS: gql`
      query {
        Playlists {
          Id
          Name
          Duration
          SongsCount
          IsReadonly
        }
      }
    `,

    PLAYLIST: gql`
      query($id: ID!) {
        Playlist(PlaylistId: $id) {
          Id
          Name
          Duration
          SongsCount
          IsReadonly
        }
      }
    `,

    TRACKS_FROM_PLAYLIST: gql`
      query($id: ID!, $skip: Float!, $amount: Float!) {
        PlaylistSongs(PlaylistId: $id, Skip: $skip, Take: $amount) {
          Title
          Duration
          Id: YouTubeId
        }
      }
    `,

    SEARCH_TRACK: gql`
      query($term: String!) {
        Songs(searchTerm: $term) {
          Title
          Duration
          Id
        }
      }
    `,

    TRACK_FROM_URL: gql`
      query($url: String!) {
        Song(songUrl: $url) {
          Title
          Duration
          Id
        }
      }
    `,

    RELATED_TRACKS: gql`
      query($id: String!) {
        Radio(startId: $id) {
          Title
          Duration
          Id
        }
      }
    `,

    LISTEN_MOE_CHECK_FAVORITE: gql`
      query checkFavorite($songs: [Int!]!) {
        checkFavorite(songs: $songs)
      }
    `,

    LISTEN_MOE_CHECK_FAVORITES: gql`
      query($songs: [Int!]!, $songsWithoutAlbum: [Int!]!) {
        songs: checkFavorite(songs: $songs)
        songsWithoutAlbum: checkFavorite(songs: $songsWithoutAlbum)
      }
    `,
  },

  MUTATION: {
    CREATE_PLAYLIST: gql`
      mutation($name: String!) {
        CreateNewPlaylist(createNewPlaylistArgs: { Name: $name }) {
          Id
        }
      }
    `,

    CREATE_PLAYLIST_WITH_SONGS: gql`
      mutation($name: String!, $songs: [SongInputType!]) {
        CreateNewPlaylistByVideoUrls(
          createNewPlaylistArgs: { Name: $name, Songs: $songs }
        ) {
          Id
        }
      }
    `,

    DELETE_PLAYLIST: gql`
      mutation($id: ID!) {
        DeletePlaylist(deletePlaylistArgs: { PlaylistId: $id })
      }
    `,

    ADD_TRACK_TO_PLAYLIST: gql`
      mutation(
        $id: ID!
        $trackId: String!
        $title: String!
        $duration: Float!
      ) {
        AddSongToPlaylist(
          addSongArgs: {
            PlaylistId: $id
            Id: $trackId
            Title: $title
            Duration: $duration
          }
        )
      }
    `,

    ADD_TRACKS_TO_PLAYLIST_BY_URLS: gql`
      mutation($id: ID!, $songs: [SongInputType!]) {
        AddSongsToPlaylistByUrls(
          addSongArgs: { PlaylistId: $id, Songs: $songs }
        )
      }
    `,

    REMOVE_TRACK_FROM_PLAYLIST: gql`
      mutation($id: ID!, $trackId: ID!) {
        RemoveSongFromPlaylist(
          removeSongFromPlaylistArgs: { PlaylistId: $id, SongId: $trackId }
        )
      }
    `,

    MOVE_TRACK_TO: gql`
      mutation($id: ID!, $trackId: String!, $position: String!) {
        PatchSong(
          patchSongArgs: {
            PlaylistId: $id
            YtId: $trackId
            Patch: [{ op: "replace", path: "OrderId", value: $position }]
          }
        )
      }
    `,

    SUBSCRIBE_PLAYLIST: gql`
      mutation($id: ID!) {
        AddReadingUserToPlaylist(
          addReadingUserToPlaylistArgs: { PlaylistId: $id }
        )
      }
    `,

    UNSUBSCRIBE_PLAYLIST: gql`
      mutation($id: ID!) {
        RemoveReadingUserFromPlaylist(
          removeReadingUserFromPlaylistArgs: { PlaylistId: $id }
        )
      }
    `,

    LISTEN_MOE_FAVORITE_SONG: gql`
      mutation($id: Int!) {
        favoriteSong(id: $id) {
          id
        }
      }
    `,

    LISTEN_MOE_LOGIN: gql`
      mutation($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          user {
            uuid
            username
            displayName
            avatarImage
            bannerImage
            bio
            roles {
              name
              slug
              color
              songRequests
            }
            additionalSongRequests
            uploadLimit
          }
          token
          mfa
        }
      }
    `,

    LISTEN_MOE_FAVORITE: gql`
      mutation($id: Int!) {
        favoriteSong(id: $id) {
          id
        }
      }
    `,

    REPLACE_TRACK: gql`
      mutation($oldSong: ResolvedSong!, $newSong: ResolvedSong!) {
        ReplaceSong(replaceSongArgs: { OldSong: $oldSong, NewSong: $newSong })
      }
    `,
  },
};
