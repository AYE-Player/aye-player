import DragHandleIcon from "@material-ui/icons/DragHandle";
import { withStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { TrackModel } from "../../dataLayer/models/Track";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import PlaylistEntityMenu from "./PlaylistEntityMenu";

interface IProps {
  duration: string;
  track: TrackModel;
  index: number;
  onClick: Function;
}

const Container = styled.div<any>`
  height: 48px;
  width: calc(100% - 10px);
  display: flex;
  position: relative;
  align-items: center;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover > svg {
    opacity: 1;
  }
  &:hover > div {
    color: #4fc3f7;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: inline-block;
  cursor: pointer;
  width: 224px;
  padding: 8px 0;
  padding-left: 8px;
  color: ${(props: any) => (props.active ? "#4fc3f7" : "")};
`;

const Title = styled.div<any>`
  padding-right: 16px;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  ${(props: any) => {
    if (props.length >= 30) {
      return `div {

        transform: translateX(0);
        transition-timing-function: linear;
        transition-duration: ${
          props.length <= 30 ? "1s" : props.length <= 45 ? "2s" : "3s"
        };
      }
      :hover div {
        transform: translateX(calc(200px - 100%));
      }`;
    }
  }}
`;

const Duration = styled.div`
  font-size: 12px;
`;

const DragHandle = withStyles({
  root: {
    opacity: 0,
    cursor: "grab"
  }
})(DragHandleIcon);

const PlaylistEntity: React.FunctionComponent<IProps> = props => {
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
            active={
              player.currentTrack
                ? player.currentTrack.id === props.track.id
                : false
            }
            onClick={() => props.onClick(props.track)}
          >
            <Title length={props.track.title.length}>
              <div style={{ display: "inline-block" }}>{props.track.title}</div>
            </Title>
            <Duration>{props.duration}</Duration>
          </TrackInfoContainer>
          <PlaylistEntityMenu id={props.track.id} />
        </Container>
      )}
    </Draggable>
  );
};

export default observer(PlaylistEntity);
