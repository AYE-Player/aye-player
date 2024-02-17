/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable promise/always-return */
import ControlPoint from '@mui/icons-material/ControlPoint';
import { Ref } from 'mobx-keystone';
import { Observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { nanoid } from 'nanoid';
import { CircularProgress } from '@mui/material';
import { resolveHtmlPath } from '../../../main/util';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import { removeControlCharacters } from '../../../helpers';
import { Channel, LogType } from '../../../types/enums';
import CustomButton from '../Customs/CustomButton';
import CustomTextareaDialog from '../Customs/CustomTextareaDialog';
import SnackMessage from '../Customs/SnackMessage';
import { useStore } from '../StoreProvider';
import ExtendedPlaylistEntity from './ExtendedPlaylistEntity';

const Container = styled.div<{ $loading: boolean }>`
  height: calc(100% - 48px);
  width: 100%;
  top: 0;
  ${({ $loading }) =>
    $loading
      ? `display: flex;
  justify-content: center;
  align-items: center;`
      : ''}
`;

const ScrollContainer = styled.div`
  overflow: auto;
  width: 100%;
  height: calc(100% - 64px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const ExtendedPlaylist: React.FunctionComponent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { id } = useParams();

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [addTracksOpen, setAddTracksOpen] = React.useState(false);
  const [songsToAdd, setSongsToAdd] = React.useState<{ url: string }[]>([]);
  PlayerInterop.init();

  const { queue, player, playlists, app, trackHistory } = useStore();

  const playlist = playlists.getListById(id!);

  if (!playlist) {
    window.location.href = resolveHtmlPath('app.html');
  }

  app.setActivePlaylist(id!);

  useEffect(() => {
    const controller = new AbortController();

    if (!isLoaded) {
      playlist
        ?.getTracks()
        .then(() => {
          setIsLoaded(true);
        })
        .catch((error) => {
          window.electron.ipcRenderer.sendMessage(Channel.LOG, {
            message: `[ExtendedPlaylist] error getting playlist tracks ${
              (JSON.stringify(error, null, 2), LogType.ERROR)
            }`,

            type: 'error',
          });
        });
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (track: Ref<Track>) => {
    const idx = playlist!.getIndexOfTrack(track);

    if (player.currentTrack) {
      trackHistory.addTrack(player.currentTrack.current);
    }
    queue.clear();
    queue.addTracks(
      playlist!.getTracksStartingFrom(idx).map((pTrack) => pTrack.current),
    );
    player.setCurrentPlaylist(playlist);
    player.playTrack(queue.currentTrack!.current);
    PlayerInterop.playTrack(queue.currentTrack!.current);
  };

  const onDragEnd = async (result: DropResult) => {
    try {
      await playlist!.moveTrackTo(
        result.source.index,
        result.destination!.index,
      );
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error changing Track order for playlist ${playlist!.id}
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
      });
    }
  };

  const onAddTracksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSongsToAdd(
      removeControlCharacters(event.target.value)
        .split(',')
        .map((url) => ({
          url,
        })),
    );
  };

  const addTracksToPlaylist = async () => {
    try {
      setAddTracksOpen(false);
      await playlist!.addTracksByUrls(songsToAdd);
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="success"
            message={t('addedTracksToPlaylist')}
          />
        ),
      });
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error adding tracks to playlist ${
          playlist!.id
        } ${JSON.stringify(error, null, 2)}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('Error.couldNotAddTrack')}`}
          />
        ),
      });
    }
  };

  const handleAddTracksClose = () => {
    setAddTracksOpen(false);
  };

  return isLoaded ? (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Header>{playlist!.name}</Header>
        <Container $loading={!isLoaded}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <Observer>
                {() => (
                  <ScrollContainer
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {playlist!.tracks.map((track, index) => {
                      return (
                        <ExtendedPlaylistEntity
                          duration={track.current.formattedDuration}
                          track={track}
                          key={`${track.current.id}-${nanoid()}`}
                          index={index}
                          onClick={handleClick}
                          active={
                            player.currentTrack?.current.id ===
                              track.current.id || false
                          }
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
      <CustomTextareaDialog
        id="addTracksDialog"
        title={t('PlaylistPage.addTracks.title')}
        label={t('PlaylistPage.addTracks.label')}
        dialogText={t('PlaylistPage.addTracks.text')}
        button={
          <CustomButton
            onClick={() => setAddTracksOpen(true)}
            style={{
              width: '206px',
              height: '40px',
              position: 'absolute',
              bottom: '56px',
              right: '16px',
            }}
          >
            {t('PlaylistPage.addTracks.confirmButton')}
            <ControlPoint style={{ marginLeft: '8px' }} />
          </CustomButton>
        }
        open={addTracksOpen}
        handleClose={handleAddTracksClose}
        handleChange={onAddTracksChange}
        handleConfirm={addTracksToPlaylist}
        confirmButtonText={t('PlaylistPage.addTracks.confirmButton')}
        cancelButtonText={t('PlaylistPage.addTracks.cancelButton')}
        type="text"
        placeholder="https://www.youtube.com/watch?v=A3rvyaZFCN4"
      />
    </>
  ) : (
    <Container $loading={!isLoaded}>
      <CircularProgress color="success" size="4rem" />
    </Container>
  );
};

export default ExtendedPlaylist;
