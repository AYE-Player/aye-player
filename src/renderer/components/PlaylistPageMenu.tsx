import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import withStyles from '@material-ui/core/styles/withStyles';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Channel } from '../../types/enums';
import PlayerInterop from '../dataLayer/api/PlayerInterop';
import SnackMessage from './Customs/SnackMessage';
import { useStore } from './StoreProvider';

interface IPlaylistPageMenuProps {
  id: string;
  handleAddTracksToList: () => void;
  setSelectedPlaylist: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const Container = styled.div`
  height: 30px;
  width: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const StyledMenu = withStyles({
  paper: {
    backgroundColor: '#3D4653',
    boxShadow:
      '0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)',
    color: '#f2f5f4',
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

const PlaylistPageMenu: React.FunctionComponent<IPlaylistPageMenuProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { id, handleAddTracksToList, setSelectedPlaylist } = props;

  PlayerInterop.init();

  const { player, playlists, queue } = useStore();
  const playlist = playlists.getListById(id);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoadClick = async () => {
    try {
      if (playlist?.tracks.length === 0) {
        await playlist.getTracks();
      }

      queue.clear();
      queue.addTracks(playlist!.tracks.map((track) => track.current));
      player.setCurrentPlaylist(playlist);
      player.playTrack(playlist!.tracks[0].current);
      PlayerInterop.playTrack(playlist!.tracks[0].current);
      setAnchorEl(null);
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error loading PlaylistTracks ${JSON.stringify(
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
            message={t('Error.getPlaylists')}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const handleDeleteClick = async () => {
    try {
      setAnchorEl(null);
      await playlists.remove(playlist!.id);
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="success"
            message={t('Playlist.deleted')}
          />
        ),
        disableWindowBlurListener: true,
      });
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error deleting Playlist ${JSON.stringify(error, null, 2)}`,
        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={t('Playlist.couldNotDelete')}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const handleAddPlaylistToQueueClick = async () => {
    try {
      if (playlist?.tracks.length === 0) {
        await playlist.getTracks();
      }

      queue.addTracks(playlist!.tracks.map((track) => track.current));
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error loading PlaylistTracks ${JSON.stringify(
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
            message={t('Error.getPlaylists')}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container onClick={handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={handleLoadClick}
            disabled={playlist!.trackCount === 0}
          >
            {t('EntityMenu.loadPlaylist')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSelectedPlaylist(id);
              handleAddTracksToList();
            }}
          >
            {t('EntityMenu.addTracksToPlaylist')}
          </MenuItem>
          <MenuItem
            onClick={handleAddPlaylistToQueueClick}
            disabled={playlist!.trackCount === 0}
          >
            {t('EntityMenu.addPlaylistToQueue')}
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            {t('EntityMenu.deletePlaylist')}
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default PlaylistPageMenu;
