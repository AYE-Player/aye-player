import DragHandleIcon from "@material-ui/icons/DragHandle";
import { withStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { TrackModel } from "../../dataLayer/models/Track";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import ExtendedPlaylistEntityMenu from "./ExtendedPlaylistEntityMenu";

interface IProps {
  duration: string;
  track: TrackModel;
  index: number;
  onClick: Function;
}

const Container = styled.div`
  height: 72px;
  width: calc(100% - 16px);
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover > svg {
    opacity: 1;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  padding-left: 8px;
  width: 100%;
  color: ${(props: any) => (props.active ? "#4fc3f7" : "")};
`;

const Title = styled.div<any>`
  padding-right: 16px;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  ${(props: any) => {
    if (props.length >= 30) {
      return `div {

      transform: translateX(0);
      transition-timing-function: cubic-bezier(0.42,0,0.58,1);
      transition-duration: 1s;
    }
    :hover div {
      transform: translateX(calc(300px - 100%));
    }`;
    }
  }}
`;

const Duration = styled.div`
  font-size: 14px;
`;

const TrackImageContainer = styled.div`
  width: 48px;
  height: 48px;
  margin-right: 32px;
  border-radius: 24px;
  overflow: hidden;
`;

const TrackImage = styled.img`
  position: relative;
  width: 64px;
  height: 48px;
  transform: scale(1.4) translate(-5px);
`;

const DragHandle = withStyles({
  root: {
    opacity: 0,
    cursor: "grab"
  }
})(DragHandleIcon);

const ExtendedPlaylistEntity: React.FunctionComponent<IProps> = props => {
  const Store = ({ player }: RootStoreModel) => ({
    player
  });

  const { player } = useInject(Store);

  return (
    <Draggable
      key={props.index}
      draggableId={props.track.id}
      index={props.index}
    >
      {(provided: any) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <DragHandle fontSize="small" />
          <TrackInfoContainer
            active={player.currentTrack.id === props.track.id}
            onClick={() => props.onClick(props.track)}
          >
            <TrackImageContainer>
              <TrackImage
                src={`https://img.youtube.com/vi/${props.track.id}/default.jpg`}
              />
            </TrackImageContainer>
            <Title length={props.track.title.length}>{props.track.title}</Title>
            <Duration>{props.duration}</Duration>
          </TrackInfoContainer>
          <ExtendedPlaylistEntityMenu id={props.track.id} />
        </Container>
      )}
    </Draggable>
  );
};

export default observer(ExtendedPlaylistEntity);
