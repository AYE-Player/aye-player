import React from "react";
import styled from "styled-components";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";

interface IProps {
  title: string;
  duration: string;
  videoId: string;
}

const Container = styled.div`
  height: 50px;
  width: 200px;
`;

const Title = styled.div``;

const Duration = styled.div`
  font-size: 12px;
`;

const PlaylistEntity: React.FunctionComponent<IProps> = props => {
  const PlayerStore = ({ player }: RootStoreModel) => ({
    player: player
  });

  const { player } = useInject(PlayerStore);

  return (
    <Container onClick={() => player.playTrack(props.videoId)}>
      <Title>{props.title}</Title>
      <Duration>{props.duration}</Duration>
    </Container>
  );
};

export default PlaylistEntity;
