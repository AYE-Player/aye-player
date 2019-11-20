import DragHandleIcon from "@material-ui/icons/DragHandle";
import { withStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { TrackModel } from "../../dataLayer/models/Track";
import QueueEntityMenu from "./QueueEntityMenu";

interface IProps {
  duration: string;
  track: TrackModel;
  index: number;
  onClick: Function;
  dragId: string;
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
        transition-timing-function: cubic-bezier(0.42,0,0.58,1);
        transition-duration: 1s;
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

const Dot = styled.span`
  height: 8px;
  width: 8px;
  background-color: #e53935;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`;

const DragHandle = withStyles({
  root: {
    opacity: 0,
    cursor: "grab"
  }
})(DragHandleIcon);

const QueueEntity: React.FunctionComponent<IProps> = props => {
  console.log(props.track);
  
  return (
    <Draggable
      key={props.dragId}
      draggableId={props.dragId}
      index={props.index}
    >
      {(provided: any) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <DragHandle fontSize="small" />
          <TrackInfoContainer onClick={() => props.onClick(props.index)}>
            <Title length={props.track.title.length}>
              <div style={{ display: "inline-block" }}>{props.track.title}</div>
            </Title>
            <Duration>
              {!props.track.isLivestream ? (
                props.duration
              ) : (
                <div>
                  <Dot />
                  LIVE
                </div>
              )}
            </Duration>
          </TrackInfoContainer>
          <QueueEntityMenu id={props.track.id} />
        </Container>
      )}
    </Draggable>
  );
};

export default observer(QueueEntity);
