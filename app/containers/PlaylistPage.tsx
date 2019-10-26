import React from "react";
import useInject from "../hooks/useInject";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import { Route } from "react-router";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Playlist from "../components/Playlist/Playlist";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div``;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
`;

const PlaylistPage: React.FunctionComponent = () => {
  const Store = ({ playlists }: RootStoreModel) => ({
    playlists: playlists
  });

  const { playlists } = useInject(Store);

  return (
    <Container>
      <Header>Playlists</Header>
      <PlaylistContainer>
        {playlists.lists.map(playlist => (
          <Link to={`/playlist/${playlist.id}`}>{playlist.name}</Link>
        ))}
      </PlaylistContainer>
      <Route path="/playlist/:id" component={Playlist}></Route>
    </Container>
  );
};

export default PlaylistPage;
