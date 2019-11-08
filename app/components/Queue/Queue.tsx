import QueueMusicIcon from "@material-ui/icons/QueueMusic";
import { observer } from "mobx-react-lite";
import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import QueueEntity from "./QueueEntity";
import { useTranslation } from "react-i18next";

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

const Control = styled.div`
  margin: 0 10px;
  width: 24px;
  height: 24px;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 364px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Queue: React.FunctionComponent<IProps> = props => {
  const { t } = useTranslation();

  const [value, setValue] = React.useState(true); //boolean state

  const Store = ({ app, queue, player }: RootStoreModel) => ({
    app,
    queue,
    player
  });

  const { app, queue, player } = useInject(Store);

  const _handleClick = (index: number) => {
    queue.jumpTo(index);
    player.playTrack(queue.currentTrack);
    setValue(!value);
  };

  const _onDragEnd = (result: IDragResult) => {
    queue.moveTrack(result.source.index, result.destination.index);
  };

  const _showQueue = () => {
    app.toggleQueueDisplay();
  };

  player.currentTrack;

  const renderQueue = () => (
    <Container>
      <DragDropContext onDragEnd={_onDragEnd}>
        <Header>
          Queue
          <Control>
            <QueueMusicIcon onClick={() => _showQueue()} />
          </Control>
        </Header>
        <Droppable droppableId="droppable">
          {(provided: any) => (
            <ScrollContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {queue.tracks.map((track, index) => {
                return (
                  <QueueEntity
                    duration={track.formattedDuration}
                    track={track}
                    key={track.id}
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

  return queue.tracks.length !== 0 ? (
    renderQueue()
  ) : (
    <Container>
      <Header>
        Queue
        <Control>
          <QueueMusicIcon onClick={() => _showQueue()} />
        </Control>
      </Header>
      <ScrollContainer>{t("Queue.noTracks")}</ScrollContainer>
    </Container>
  );
};

export default observer(Queue);
