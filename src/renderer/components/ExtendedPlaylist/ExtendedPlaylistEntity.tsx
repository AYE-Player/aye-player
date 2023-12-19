/* eslint-disable react/no-unstable-nested-components */
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
import { useStore } from '../StoreProvider';
import ExtendedPlaylistEntityMenu from './ExtendedPlaylistEntityMenu';

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  active: boolean;
  onClick: (track: Ref<Track>) => void;
}

interface ITrackInfoContainerProps {
  active: boolean;
}

const DragHandle = styled(DragHandleIcon)`
  opacity: 0;
  cursor: grab;
`;

const Container = styled.div`
  height: 72px;
  width: calc(100% - 16px);
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
`;
const TrackInfoContainer = styled.div<ITrackInfoContainerProps>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  padding-left: 8px;
  width: calc(100% - 200px);
  color: ${({ active }) => (active ? '#f0ad4e' : '')};
`;

const TitleWrapper = styled.div`
  overflow: hidden;
  margin-left: 24px;
  width: 85%;
`;

const Title = styled.div`
  white-space: nowrap;
`;

const Duration = styled.div`
  margin-right: 48px;
`;

const TrackImageContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  overflow: hidden;
`;

const TrackImage = styled.img`
  position: relative;
  width: 64px;
  height: 48px;
  transform: scale(1.4) translate(-5px);
`;

const ExtendedPlaylistEntity: React.FunctionComponent<IProps> = (props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { active, duration, index, onClick, track } = props;

  const { playlists } = useStore();

  const [open, setOpen] = React.useState(false);
  const [openCreatePlaylistDialog, setOpenCreatePlaylistDialog] =
    React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = async (id: string, trackToAdd: Track) => {
    setOpen(false);
    const playlist = playlists.getListById(id);
    try {
      if (
        playlist!.tracks.find((pTrack) => pTrack.current.id === trackToAdd.id)
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
        await playlist!.addTrack(trackToAdd);
        enqueueSnackbar('', {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="success"
              message={`${t('SearchEntity.trackAdded')} ${playlist!.name}`}
            />
          ),
          disableWindowBlurListener: true,
        });
      }
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error adding track to playlist ${
          playlist!.id
        } ${JSON.stringify(error, null, 2)}`,

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
            variant="success"
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
      <Draggable key={index} draggableId={track.current.id} index={index}>
        {(provided) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DragHandle fontSize="small" />
            <TrackInfoContainer active={active} onClick={() => onClick(track)}>
              <TrackImageContainer>
                <TrackImage
                  src={`https://img.youtube.com/vi/${track.current.id}/default.jpg`}
                />
              </TrackImageContainer>
              <TitleWrapper>
                <Title>{track.current.title}</Title>
              </TitleWrapper>
            </TrackInfoContainer>
            <Duration>{duration}</Duration>
            <ExtendedPlaylistEntityMenu
              trackRef={track}
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

export default observer(ExtendedPlaylistEntity);
