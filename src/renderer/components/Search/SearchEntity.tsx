import { Ref } from 'mobx-keystone';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Channel } from '../../../types/enums';
import Track from '../../dataLayer/models/Track';
import CustomFormDialog from '../Customs/CustomFormDialog';
import CustomListDialog from '../Customs/CustomListDialog';
import SnackMessage from '../Customs/SnackMessage';
import { useStore } from '../StoreProvider';
import SearchEntityMenu from './SearchEntityMenu';

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  onDoubleClick: (track: Ref<Track>) => void;
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
  &:hover > div {
    color: #f0ad4e;
  }
`;

const TrackInfoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  padding-left: 8px;
  width: calc(100% - 200px);
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

const SearchEntity: React.FunctionComponent<IProps> = (props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { playlists } = useStore();
  const { duration, index, onDoubleClick, track } = props;

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
        { Url: `https://www.youtube.com/watch?v${track.current.id}` },
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
          2
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
    <Container key={`SearchEntity-${index}`}>
      <TrackInfoContainer onDoubleClick={() => onDoubleClick(track)}>
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
      <SearchEntityMenu
        trackRef={track}
        openListDialog={handleClickOpen}
        isLivestream={track.current.isLivestream}
      />
      <CustomListDialog
        dialogTitle={t('SearchEntity.selectPlaylist')}
        open={open}
        handleClose={handlePlaylistSelectDialogClose}
        track={track}
        onSelect={handleClose}
        createListItem={createListItem}
        listItemText={t('SearchEntity.createListText')}
        options={playlists.lists
          .filter((list) => !list.isReadonly)
          .map((list) => {
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
    </Container>
  );
};

export default observer(SearchEntity);
