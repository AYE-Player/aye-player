import { GRAPHQL, graphQLListenMoe } from "./graphQL";
import {
  ListenMoeLoginData,
  ListenMoeLoginInput,
  ListenMoeFavoriteInput,
  ListenMoeCheckFavoriteInput,
  ListenMoeCheckFavoriteData,
} from "./graphQLTypes";

class ListenMoeApiClient {
  async login(username: string, password: string): Promise<string> {
    const {
      data: {
        login: { token },
      },
    } = await graphQLListenMoe.mutate<ListenMoeLoginData, ListenMoeLoginInput>({
      mutation: GRAPHQL.MUTATION.LISTEN_MOE_LOGIN,
      variables: {
        username,
        password,
      },
    });

    return token;
  }

  async favorite(id: number) {
    await graphQLListenMoe.mutate<null, ListenMoeFavoriteInput>({
      mutation: GRAPHQL.MUTATION.LISTEN_MOE_FAVORITE,
      variables: {
        id,
      },
    });
  }

  async checkFavorite(songs: number[]): Promise<number[]> {
    const {
      data: { checkFavorite },
    } = await graphQLListenMoe.query<
      ListenMoeCheckFavoriteData,
      ListenMoeCheckFavoriteInput
    >({
      query: GRAPHQL.QUERY.LISTEN_MOE_CHECK_FAVORITE,
      variables: {
        songs,
      },
    });

    return checkFavorite;
  }
}

export default new ListenMoeApiClient();
