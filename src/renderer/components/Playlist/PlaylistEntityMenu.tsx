/* eslint-disable react/jsx-props-no-spreading */
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import withStyles from '@material-ui/core/styles/withStyles';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { Ref } from 'mobx-keystone';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ytsr from 'ytsr';
import { Channel } from '../../../types/enums';
import { timestringToSeconds } from '../../../helpers';
import ApiClient from '../../dataLayer/api/ApiClient';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import SnackMessage from '../Customs/SnackMessage';
import { useStore } from '../StoreProvider';

interface IPlaylistEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: () => void;
  isReadOnly: boolean;
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  margin-left: 8px;
  display: block;
  right: 0;
  cursor: pointer;
  z-index: 10;
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
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const PlaylistEntityMenu: React.FunctionComponent<IPlaylistEntityMenuProps> = (
  props
) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { queue, player, trackCache } = useStore();
  const { isReadOnly, openListDialog, trackRef } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveTrack = async () => {
    try {
      await player.currentPlaylist!.current.removeTrackById(
        trackRef.current.id
      );
      setAnchorEl(null);
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error removing track from playlist ${
          trackRef.current.id
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
      `https://www.youtube.com/watch?v=${trackRef.current.id}`
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
    const relatedTracks = await ApiClient.getRelatedTracks(trackRef.current.id);
    const tracks: Track[] = [];
    for (const trk of relatedTracks) {
      let track: Track;
      if (!trackCache.getTrackById(trk.Id)) {
        track = new Track({
          id: trk.Id,
          title: trk.Title,
          duration: trk.Duration,
        });
        trackCache.add(track);
      } else {
        track = trackCache.getTrackById(trk.Id)!;
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
      trackToReplace.current.title
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
    player.currentPlaylist?.current.replaceTrack(trackToReplace, track);
  };

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container onClick={handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handlePlayNextTrack}>
            {t('EntityMenu.playNext')}
          </MenuItem>
          <MenuItem onClick={addToQueue}>{t('EntityMenu.addToQueue')}</MenuItem>
          <MenuItem onClick={handleRemoveTrack} disabled={isReadOnly}>
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

export default PlaylistEntityMenu;
