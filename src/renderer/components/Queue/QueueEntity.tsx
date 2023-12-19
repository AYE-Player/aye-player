/* eslint-disable react/jsx-props-no-spreading */
import DragHandleIcon from '@material-ui/icons/DragHandle';
import { Ref } from 'mobx-keystone';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Channel } from '../../../types/enums';
import Track from '../../dataLayer/models/Track';
import CustomFormDialog from '../Customs/CustomFormDialog';
import CustomListDialog from '../Customs/CustomListDialog';
import SnackMessage from '../Customs/SnackMessage';
import ScrollingText from '../ScrollingText';
import { useStore } from '../StoreProvider';
import QueueEntityMenu from './QueueEntityMenu';

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  onClick: (index: number) => void;
  dragId: string;
}

const DragHandle = styled(DragHandleIcon)`
  opacity: 0;
  cursor: grab;
  z-index: 10;
`;

const Container = styled.div`
  height: 48px;
  width: calc(100% - 8px);
  display: flex;
  position: relative;
  align-items: center;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover ${DragHandle} {
    opacity: 1;
  }
  &:hover > div {
    color: #f0ad4e;
  }
`;
const TrackInfoContainer = styled.div`
  display: inline-block;
  cursor: pointer;
  width: 224px;
  padding: 8px 0;
  padding-left: 8px;
`;

const Title = styled.div`
  white-space: nowrap;
  position: relative;
  z-index: 10;
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

const QueueEntity: React.FunctionComponent<IProps> = (props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { playlists } = useStore();
  const { dragId, duration, index, onClick, track } = props;

  const [open, setOpen] = React.useState(false);
  const [openCreatePlaylistDialog, setOpenCreatePlaylistDialog] =
    React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = async (id: string, givenTrack: Track) => {
    setOpen(false);
    const playlist = playlists.getListById(id);
    try {
      if (
        playlist!.tracks.find((pTrack) => pTrack.current.id === givenTrack.id)
      ) {
        enqueueSnackbar('', {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="warning"
              message={t('SearchEntity.trackExists')}
            />
          ),
          disableWindowBlurListener: true,
        });
      } else {
        await playlist!.addTrack(givenTrack);
        enqueueSnackbar('', {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="info"
              message={`${t('SearchEntity.trackAdded')} ${playlist!.name}`}
            />
          ),
          disableWindowBlurListener: true,
        });
      }
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error adding Track to playlist. Error: ${JSON.stringify(
          error,
          null,
          2,
        )}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={t('Error.couldNotAddTrack')}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const createListItem = () => {
    setOpen(false);
    setOpenCreatePlaylistDialog(true);
  };

  const createPlaylist = async () => {
    setOpenCreatePlaylistDialog(false);
    try {
      await playlists.createListWithSongs(newPlaylistName, [
        { url: `https://www.youtube.com/watch?v${track.current.id}` },
      ]);

      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="info"
            message={`${t('createdAndAdded')}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `[createListWithSongs] Error creating playlist ${JSON.stringify(
          error,
          null,
          2,
        )}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('Playlist.couldNotCreate')}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const onPlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlaylistName(event.target.value);
  };

  const handlePlaylistCreateDialogClose = () => {
    setOpenCreatePlaylistDialog(false);
  };

  const handlePlaylistSelectDialogClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Draggable key={dragId} draggableId={dragId} index={index}>
        {(provided) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DragHandle fontSize="small" />
            <TrackInfoContainer
              onClick={() => onClick(index)}
              id={`queue${track.current.id}-${index}`}
            >
              <ScrollingText scrollId={`queue${track.current.id}-${index}`}>
                <Title>{track.current.title}</Title>
              </ScrollingText>
              <Duration>
                {!track.current.isLivestream ? (
                  duration
                ) : (
                  <div>
                    <Dot />
                    LIVE
                  </div>
                )}
              </Duration>
            </TrackInfoContainer>
            <QueueEntityMenu
              trackRef={track}
              isLivestream={track.current.isLivestream}
              openListDialog={handleClickOpen}
            />
          </Container>
        )}
      </Draggable>
      <CustomListDialog
        dialogTitle={t('SearchEntity.selectPlaylist')}
        open={open}
        handleClose={handlePlaylistSelectDialogClose}
        track={track}
        onSelect={handleClose}
        createListItem={createListItem}
        listItemText={t('SearchEntity.createListText')}
        options={playlists.lists.map((list) => {
          return {
            name: list.name,
            id: list.id,
          };
        })}
      />
      <CustomFormDialog
        id="createPlaylistDialog"
        title={t('PlaylistPage.dialog.title')}
        label={t('PlaylistPage.dialog.label')}
        dialogText={t('PlaylistPage.dialog.text')}
        open={openCreatePlaylistDialog}
        handleClose={handlePlaylistCreateDialogClose}
        handleConfirm={createPlaylist}
        handleChange={onPlaylistNameChange}
        confirmButtonText={t('PlaylistPage.dialog.confirmButton')}
        cancelButtonText={t('PlaylistPage.dialog.cancelButton')}
        type="text"
      />
    </>
  );
};

export default observer(QueueEntity);
