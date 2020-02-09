import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";

export const graphQLClient = new ApolloClient({
  cache: new InMemoryCache(),
  // @ts-ignore
  link: new HttpLink({
    uri: "https://api.aye-player.de/v1/",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    // @ts-ignore
    fetch
  }),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache"
    },
    mutate: {
      fetchPolicy: "no-cache"
    }
  }
});

export const GRAPHQL = {
  ENDPOINT: "https://api.aye-player.de/v1/",

  QUERY: {
    PLAYLISTS: gql`
      query {
        Playlists {
          Id
          Name
          Duration
          SongsCount
        }
      }
    `,

    PLAYLIST: gql`
      query($id: uuid!) {
        {
          Playlist(PlaylistId: $id) {
            Id
            Name
            Duration
            SongsCount
          }
        }
      }
    `
  },

  MUTATION: {
    CREATE_PLAYLIST: gql`
      mutation($name: String!) {
        CreateNewPlaylist(createNewPlaylistArgs:
          { Name: $name } ) {
            Id
          }
      }
    `,

    CREATE_PLAYLIST_WITH_SONG: gql`

    `,
  }
};
