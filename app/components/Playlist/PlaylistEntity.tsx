import React from "react";
import styled from "styled-components";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";
import { TrackModel } from "app/store/Track";
import PlaylistEntityMenu from "./PlaylistEntityMenu";
import { observer } from "mobx-react-lite";

interface IProps {
  duration: string;
  track: TrackModel;
}

const Container = styled.div<any>`
  height: 48px;
  width: calc(100% - 10px);
  display: flex;
  position: relative;
  align-items: center;
  border-bottom: 1px solid #565f6c;
  &:last-child {
    border-bottom: none;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: inline-block;
  cursor: pointer;
  width: 260px;
  padding: 10px 0;
  color: ${(props: any) => (props.active ? "#99ccff" : "")};
`;

const Title = styled.div<any>``;

const Duration = styled.div`
  font-size: 12px;
`;

const PlaylistEntity: React.FunctionComponent<IProps> = props => {
  const Store = ({ player, playlist, queue }: RootStoreModel) => ({
    player: player,
    playlist: playlist,
    queue: queue
  });

  const { player, playlist, queue } = useInject(Store);

  const _handleClick = (track: TrackModel) => {
    const idx = playlist.getIndexOfTrack(track);

    queue.clear();
    queue.addTracks(playlist.getTracksStartingFrom(idx));
    player.playTrack(queue.currentTrack);
  };

  return (
    <Container>
      <TrackInfoContainer
        active={player.currentTrackId === props.track.id}
        onClick={() => _handleClick(props.track)}
      >
        <Title>{props.track.title}</Title>
        <Duration>{props.duration}</Duration>
      </TrackInfoContainer>
      <PlaylistEntityMenu id={props.track.id} />
    </Container>
  );
};

export default observer(PlaylistEntity);
