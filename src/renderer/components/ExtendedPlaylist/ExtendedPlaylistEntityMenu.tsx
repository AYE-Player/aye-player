import { ClickAwayListener, Menu, MenuProps, MenuItem } from '@mui/material';
import { withStyles } from '@mui/styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Ref } from 'mobx-keystone';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ytsr from 'ytsr';
import { getRelatedTracks } from 'renderer/dataLayer/api/fetchers';
import { timestringToSeconds } from '../../../helpers';
import { Channel } from '../../../types/enums';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import SnackMessage from '../Customs/SnackMessage';
import { useStore } from '../StoreProvider';

interface IPlaylistEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: () => void;
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  position: absolute;
  margin-right: 16px;
  right: 0;
  cursor: pointer;
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
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

const ExtendedPlaylistEntityMenu: React.FunctionComponent<
  IPlaylistEntityMenuProps
> = (props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { openListDialog, trackRef } = props;

  const { queue, playlists, app, player, trackCache } = useStore();
  const playlist = playlists.getListById(app.selectedPlaylist);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveTrack = async () => {
    try {
      setAnchorEl(null);
      await playlist!.removeTrackById(trackRef!.current.id);
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error removing track from playlist ${
          playlist!.id
        } ${JSON.stringify(error, null, 2)}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('Error.couldNotDeleteTrack')}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const handlePlayNextTrack = () => {
    queue.addNextTrack(trackRef.current);
    setAnchorEl(null);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${trackRef.current.id}`,
    );
  };

  const addToQueue = () => {
    queue.addTrack(trackRef.current);
    setAnchorEl(null);
  };

  const startRadioMode = async () => {
    // prepare
    queue.clear();
    player.toggleRadioMode();

    // set first track
    queue.addTrack(trackRef.current);
    player.setCurrentTrack(trackRef.current);
    PlayerInterop.setTrack(trackRef.current);

    // get related tracks
    const relatedTracks = await getRelatedTracks(trackRef.current.id);
    const tracks: Track[] = [];
    for (const trk of relatedTracks) {
      let track: Track;
      if (!trackCache.getTrackById(trk.id)) {
        track = new Track({
          id: trk.id,
          title: trk.title,
          duration: trk.duration,
        });
        trackCache.add(track);
      } else {
        track = trackCache.getTrackById(trk.id)!;
      }
      tracks.push(track);
    }
    queue.addTracks(tracks);

    // toggle playing mode
    if (!player.isPlaying) {
      player.togglePlayingState();
      PlayerInterop.togglePlayingState();
    }
  };

  const replaceTrack = async (trackToReplace: Ref<Track>) => {
    const replacementTracks = await window.electron.youtube.search(
      trackToReplace.current.title,
    );

    const replacementTrack = replacementTracks.items[0] as ytsr.Video;

    if (replacementTrack.id === trackToReplace.current.id) {
      return;
    }

    // create local track
    const track = new Track({
      id: replacementTrack.url.split('watch?v=')[1],
      title: replacementTrack.title,
      duration: timestringToSeconds(replacementTrack.duration || '0'),
    });

    // add to cache
    trackCache.add(track);

    // replace track in playlist
    playlist?.replaceTrack(trackToReplace, track);
  };

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container onClick={handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="extended-playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handlePlayNextTrack}>
            {t('EntityMenu.playNext')}
          </MenuItem>
          <MenuItem onClick={addToQueue}>{t('EntityMenu.addToQueue')}</MenuItem>
          <MenuItem onClick={handleRemoveTrack}>
            {t('EntityMenu.remove')}
          </MenuItem>
          <MenuItem onClick={openListDialog}>
            {t('EntityMenu.addToPlaylist')}
          </MenuItem>
          <MenuItem onClick={startRadioMode}>
            {t('EntityMenu.startRadioMode')}
          </MenuItem>
          <MenuItem onClick={() => replaceTrack(trackRef)}>
            {t('EntityMenu.replaceTrack')}
          </MenuItem>
          <MenuItem onClick={handleCopyUrl}>{t('EntityMenu.copyURL')}</MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default ExtendedPlaylistEntityMenu;
