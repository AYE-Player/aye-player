import {
  ApolloClient,
  gql,
  InMemoryCache,
  ApolloLink,
  concat,
  HttpLink,
} from '@apollo/client';

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token') || null;
  // add authorization header
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : null,
    },
  });

  return forward(operation);
});

const authMiddlewareListenMoe = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('listenMoe_token') || null;
  // add authorization header
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
      uri: 'https://api.aye-playr.de/v1/playlists/graphql',
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const graphQLClientUserIdentity = new ApolloClient({
  cache: new InMemoryCache(),
  connectToDevTools: true,
  link: concat(
    authMiddleware,
    new HttpLink({
      uri: 'https://api.aye-playr.de/v1/useridentity/graphql',
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const graphQLClientAuth = new ApolloClient({
  cache: new InMemoryCache(),
  connectToDevTools: true,
  link: concat(
    authMiddleware,
    new HttpLink({
      uri: 'https://api.aye-playr.de/v1/auth/graphql',
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const graphQLClientSearch = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(
    authMiddleware,
    new HttpLink({
      uri: 'https://api.aye-playr.de/v1/search/graphql',
      fetch,
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const graphQLListenMoe = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(
    authMiddlewareListenMoe,
    new HttpLink({
      uri: 'https://listen.moe/graphql',
      fetch,
      fetchOptions: {
        mode: 'no-cors',
      },
    })
  ),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const GRAPHQL = {
  ENDPOINT: 'https://api.aye-playr.de/v1/playlists/gql',

  QUERY: {
    PLAYLISTS: gql`
      query {
        playlists {
          id
          name
          duration
          songCount
        }
      }
    `,

    PLAYLIST: gql`
      query ($id: ID!) {
        playlist(input: { playlistId: $id }) {
          id
          name
          duration
          songCount
        }
      }
    `,

    TRACKS_FROM_PLAYLIST: gql`
      query ($id: ID!, $skip: Int!, $amount: Int!) {
        playlistSongs(input: { playlistId: $id, skip: $skip, take: $amount }) {
          title
          duration
          id
        }
      }
    `,

    SEARCH_TRACK: gql`
      query ($term: String!) {
        songs(searchTerm: $term) {
          title
          duration
          id
        }
      }
    `,

    TRACK_FROM_URL: gql`
      query ($url: String!) {
        song(songUrl: $url) {
          title
          duration
          id
        }
      }
    `,

    RELATED_TRACKS: gql`
      query ($id: ID!) {
        radio(startId: $id) {
          title
          duration
          id
        }
      }
    `,

    LISTEN_MOE_CHECK_FAVORITE: gql`
      query checkFavorite($songs: [Int!]!) {
        checkFavorite(songs: $songs)
      }
    `,

    LISTEN_MOE_CHECK_FAVORITES: gql`
      query ($songs: [Int!]!, $songsWithoutAlbum: [Int!]!) {
        songs: checkFavorite(songs: $songs)
        songsWithoutAlbum: checkFavorite(songs: $songsWithoutAlbum)
      }
    `,

    GET_USER: gql`
      query ($userId: ID!) {
        getUser(id: $userId) {
          username
          email
          avatar
          roles {
            name
          }
        }
      }
    `,

    GET_SELF: gql`
      query {
        getSelf {
          username
          email
          avatar
          roles {
            name
          }
        }
      }
    `,
  },

  MUTATION: {
    CREATE_PLAYLIST: gql`
      mutation ($name: String!) {
        createPlaylist(input: { name: $name }) {
          id
          name
          duration
          songCount
          songs {
            id
            title
            duration
          }
        }
      }
    `,

    CREATE_PLAYLIST_WITH_SONGS: gql`
      mutation ($name: String!, $songs: [SongInput!]) {
        createPlaylistByVideoUrls(input: { name: $name, songs: $songs }) {
          id
          name
          duration
          songCount
          songs {
            id
            title
            duration
          }
        }
      }
    `,

    DELETE_PLAYLIST: gql`
      mutation ($id: ID!) {
        deletePlaylist(input: { playlistId: $id }) {
          success
        }
      }
    `,

    ADD_TRACK_TO_PLAYLIST: gql`
      mutation ($id: ID!, $trackId: ID!, $title: String!, $duration: Int!) {
        addSongToPlaylist(
          input: {
            playlistId: $id
            id: $trackId
            title: $title
            duration: $duration
          }
        ) {
          id
          name
          duration
          songCount
          songs {
            id
            title
            duration
          }
        }
      }
    `,

    ADD_TRACKS_TO_PLAYLIST_BY_URLS: gql`
      mutation ($id: ID!, $songs: [SongInput!]!) {
        addSongsToPlaylistByUrls(input: { playlistId: $id, songs: $songs }) {
          id
          name
          duration
          songCount
          songs {
            id
            title
            duration
          }
        }
      }
    `,

    REMOVE_TRACK_FROM_PLAYLIST: gql`
      mutation ($id: ID!, $trackId: ID!) {
        removeSongFromPlaylist(
          removeSongFromPlaylistArgs: { playlistId: $id, songId: $trackId }
        )
      }
    `,

    MOVE_TRACK_TO: gql`
      mutation ($id: ID!, $trackId: ID!, $position: String!) {
        patchSong(
          patchSongArgs: {
            PlaylistId: $id
            YtId: $trackId
            Patch: [{ op: "replace", path: "OrderId", value: $position }]
          }
        )
      }
    `,

    LISTEN_MOE_FAVORITE_SONG: gql`
      mutation ($id: Int!) {
        favoriteSong(id: $id) {
          id
        }
      }
    `,

    LISTEN_MOE_LOGIN: gql`
      mutation ($username: String!, $password: String!) {
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
      mutation ($id: Int!) {
        favoriteSong(id: $id) {
          id
        }
      }
    `,

    REPLACE_TRACK: gql`
      mutation ($oldSong: ResolvedSong!, $newSong: ResolvedSong!) {
        replaceSong(replaceSongArgs: { oldSong: $oldSong, newSong: $newSong })
      }
    `,

    REGISTER_ACCOUNT: gql`
      mutation ($username: String!, $email: String!, $password: String!) {
        createUser(
          input: { username: $username, email: $email, password: $password }
        ) {
          username
        }
      }
    `,

    CREATE_TOKEN: gql`
      mutation createToken($email: String!, $password: String!) {
        createToken(input: { email: $email, password: $password })
      }
    `,

    DELETE_SELF: gql`
      mutation {
        deleteSelf
      }
    `,

    UPDATE_PASSWORD: gql`
      mutation updatePassword($oldPassword: String!, $newPassword: String!) {
        updatePassword(
          input: { oldPassword: $oldPassword, newPassword: $newPassword }
        )
      }
    `,
  },
};
