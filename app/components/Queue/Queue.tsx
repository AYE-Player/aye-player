import React from "react";
import styled from "styled-components";
import QueueEntity from "./QueueEntity";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import { observer } from "mobx-react-lite";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

interface IProps {}

interface IDragResult {
  combine: any;
  destination: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  mode: string;
  reason: string;
  source: {
    index: number;
    droppableId: string;
  };
  type: string;
}

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

const Queue: React.FunctionComponent<IProps> = props => {
  const [value, setValue] = React.useState(true); //boolean state

  const Store = ({ queue, player, playlist }: RootStoreModel) => ({
    queue: queue,
    player: player,
    playlist: playlist
  });

  const { queue, player, playlist } = useInject(Store);

  const _handleClick = (index: number) => {
    queue.jumpTo(index);
    player.playTrack(queue.currentTrack);
    setValue(!value);
  };

  const _onDragEnd = (result: IDragResult) => {
    queue.moveTrack(result.source.index, result.destination.index);
  };

  player.currentTrackId;

  return (
    <Container>
      <DragDropContext onDragEnd={_onDragEnd}>
        <Header>Queue</Header>
        <Droppable droppableId="droppable">
          {(provided: any) => (
            <ScrollContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {queue.tracks.length === 0
                ? "No tracks in queue"
                : queue.tracks.map((TrackId, index) => {
                    const track = playlist.getTrackById(TrackId);

                    return (
                      <QueueEntity
                        duration={track.formattedDuration}
                        track={track}
                        key={TrackId}
                        index={index}
                        onClick={_handleClick}
                      />
                    );
                  })}
              {provided.placeholder}
            </ScrollContainer>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

export default observer(Queue);
