/* eslint-disable react/jsx-props-no-spreading */
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { Ref } from 'mobx-keystone';
import { Observer, observer } from 'mobx-react-lite';
import { nanoid } from 'nanoid';
import { useSnackbar } from 'notistack';
import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Tooltip } from '@mui/material';
import { Channel } from '../../../types/enums';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import SnackMessage from '../Customs/SnackMessage';
import { useStore } from '../StoreProvider';
import PlaylistEntity from './PlaylistEntity';

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

const Playlist: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  PlayerInterop.init();

  const { app, queue, player, trackHistory } = useStore();

  const handleClick = (track: Ref<Track>) => {
    const idx = player.currentPlaylist!.current.getIndexOfTrack(track);

    if (player.currentTrack) {
      trackHistory.addTrack(player.currentTrack.current);
    }
    queue.clear();
    queue.addTracks(
      player
        .currentPlaylist!.current.getTracksStartingFrom(idx)
        .map((cpTrack) => cpTrack.current),
    );
    player.playTrack(queue.currentTrack!.current);
    PlayerInterop.playTrack(queue.currentTrack!.current);
  };

  const showQueue = () => {
    app.toggleQueueDisplay();
  };

  const onDragEnd = async (result: DropResult) => {
    try {
      const playlist = player.currentPlaylist!.current;
      await playlist.moveTrackTo(
        result.source.index,
        result.destination!.index,
      );

      const idx = playlist.getIndexOfTrack(player.currentTrack!);

      if (result.destination!.index > idx) {
        queue.clear();
        queue.addTracks(
          playlist.getTracksStartingFrom(idx).map((track) => track.current),
        );
      }
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error changing Track order for playlist ${
          player.currentPlaylist!.current.id
        }
         Error: ${JSON.stringify(error, null, 2)}`,

        type: 'error',
      });

      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={t('Error.couldNotMoveTrack')}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const renderPlaylist = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        <Header>
          Playlist
          <ButtonAligner>
            <Control>
              <Tooltip title="Queue">
                <QueueMusicIcon onClick={() => showQueue()} />
              </Tooltip>
            </Control>
          </ButtonAligner>
        </Header>
        <Droppable droppableId="droppable">
          {(provided) => (
            <Observer>
              {() => (
                <ScrollContainer
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {player.currentPlaylist!.current.tracks.map(
                    (track, index) => {
                      return (
                        <PlaylistEntity
                          duration={track.current.formattedDuration}
                          track={track}
                          key={`${track.current.id}-${nanoid()}`}
                          index={index}
                          onClick={handleClick}
                          active={
                            player.currentTrack?.current.id === track.current.id
                          }
                        />
                      );
                    },
                  )}
                  {provided.placeholder}
                </ScrollContainer>
              )}
            </Observer>
          )}
        </Droppable>
      </Container>
    </DragDropContext>
  );

  return player.currentPlaylist ? (
    renderPlaylist()
  ) : (
    <Container>
      <Header>
        Playlist
        <ButtonAligner>
          <Control>
            <QueueMusicIcon onClick={showQueue} />
          </Control>
        </ButtonAligner>
      </Header>
      {t('Playlist.noList')}
    </Container>
  );
};

export default observer(Playlist);
