import React from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import { observer } from "mobx-react-lite";

interface IProps {}

const Container = styled.div`
  margin: 8px 5px;
  width: calc(320px - 5px);
  height: 100%;
  top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 364px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const Playlist: React.FunctionComponent<IProps> = props => {
  const Store = ({ playlist }: RootStoreModel) => ({
    playlist: playlist
  });

  const { playlist } = useInject(Store);

  return (
    <Container>
      <Header>Playlist</Header>
      <ScrollContainer>
        {playlist.tracks.map(Track => (
          <PlaylistEntity
            duration={Track.formattedDuration}
            track={Track}
            key={Track.id}
          />
        ))}
      </ScrollContainer>
    </Container>
  );
};

export default observer(Playlist);
