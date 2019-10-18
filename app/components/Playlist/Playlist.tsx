import React from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";
import { RootStoreModel } from "../../stores/RootStore";
import useInject from "../../../app/hooks/useInject";
import { observer } from "mobx-react-lite";

interface IProps {}

const Container = styled.div`
  margin: 10px 5px;
  width: calc(100% - 5px);
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
  const PlaylistStore = ({ playlist }: RootStoreModel) => ({
    playlist: playlist
  });

  const { playlist } = useInject(PlaylistStore);

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
