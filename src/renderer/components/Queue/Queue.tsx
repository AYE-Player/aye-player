import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import Radio from '@material-ui/icons/Radio';
import { Observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';
import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import { useStore } from '../StoreProvider';
import QueueEntity from './QueueEntity';

interface IProps {
  toggleExternalRadio: () => void;
}

const Container = styled.div`
  margin: 8px 5px;
  width: 315px;
  height: 100%;
  top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Control = styled.div`
  margin: 0 16px;
  width: 24px;
  height: 24px;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 376px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ButtonAligner = styled.div`
  display: flex;
  align-items: center;
`;

const Queue: React.FunctionComponent<IProps> = (props) => {
  const { t } = useTranslation();

  const [value, setValue] = React.useState(true); // boolean state
  const { app, queue, player, trackHistory } = useStore();
  const { toggleExternalRadio } = props;

  const handleClick = (index: number) => {
    if (player.currentTrack) {
      trackHistory.addTrack(player.currentTrack.current);
    }
    queue.jumpTo(index);
    player.playTrack(queue.currentTrack!.current);
    PlayerInterop.playTrack(queue.currentTrack!.current);

    setValue(!value);
  };

  const onDragEnd = (result: DropResult) => {
    queue.moveTrack(result.source.index, result.destination!.index);
  };

  const showQueue = () => {
    app.toggleQueueDisplay();
  };

  const renderQueue = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        <Header>
          Queue
          <ButtonAligner>
            <Control onClick={toggleExternalRadio}>
              <Radio />
            </Control>
            <Control>
              <QueueMusicIcon onClick={showQueue} />
            </Control>
          </ButtonAligner>
        </Header>
        <Droppable droppableId="droppable">
          {(provided) => (
            <Observer>
              {() => (
                <ScrollContainer
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {queue.tracks.map((track, index) => {
                    return (
                      <QueueEntity
                        duration={track.current.formattedDuration}
                        track={track}
                        key={`${track.current.id}-${nanoid()}`}
                        dragId={`${track.current.id}-${index}`}
                        index={index}
                        onClick={handleClick}
                      />
                    );
                  })}
                  {provided.placeholder}
                </ScrollContainer>
              )}
            </Observer>
          )}
        </Droppable>
      </Container>
    </DragDropContext>
  );

  return queue.tracks.length !== 0 ? (
    renderQueue()
  ) : (
    <Container>
      <Header>
        Queue
        <ButtonAligner>
          <Control onClick={toggleExternalRadio}>
            <Radio />
          </Control>
          <Control>
            <QueueMusicIcon onClick={showQueue} />
          </Control>
        </ButtonAligner>
      </Header>
      <ScrollContainer>{t('Queue.noTracks')}</ScrollContainer>
    </Container>
  );
};

export default Queue;
