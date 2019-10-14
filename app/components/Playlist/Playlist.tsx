import React from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";
import { RootStoreModel } from "../../../app/store/RootStore";
import useInject from "../../../app/hooks/useInject";
import { observer } from "mobx-react-lite";

interface IProps {}

const Container = styled.div`
  margin: 10px 10px;
`;

const Playlist: React.FunctionComponent<IProps> = props => {
  const PlaylistStore = ({ playlist }: RootStoreModel) => ({
    playlist: playlist
  });

  const { playlist } = useInject(PlaylistStore);

  return (
    <Container>
      {playlist.Tracks.map(Track => (
        <PlaylistEntity
        title={Track.title}
        duration={Track.formattedDuration}
        track={Track}
        key={Track.id}
      />
      ))}
    </Container>
  );
};

export default observer(Playlist);
