import { ClickAwayListener, Menu, MenuProps, MenuItem } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Ref } from 'mobx-keystone';
import { getRelatedTracks } from 'renderer/dataLayer/api/fetchers';
import Track from '../../dataLayer/models/Track';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import { useStore } from '../StoreProvider';

interface IQueueEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: () => void;
  isLivestream: boolean;
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  margin-left: 8px;
  display: block;
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

const QueueEntityMenu: React.FunctionComponent<IQueueEntityMenuProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { queue, player, trackCache } = useStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isLivestream, openListDialog, trackRef } = props;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveTrack = () => {
    queue.removeTrack(trackRef.current.id);
    setAnchorEl(null);
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

  const startRadioMode = async () => {
    // we need to copy the track here, because we will clear the queue an remove the ref
    const trackCopy = trackRef.current;
    // prepare
    queue.clear();
    player.toggleRadioMode();

    // set first track
    queue.addTrack(trackCopy);
    player.setCurrentTrack(trackCopy);
    PlayerInterop.setTrack(trackCopy);

    // get related tracks
    const relatedTracks = await getRelatedTracks(trackCopy.id);
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

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container onClick={handleClick}>
        <MoreHoriz />
        <StyledMenu
          id="queue-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {isLivestream ? (
            <span>
              <MenuItem onClick={handleRemoveTrack}>
                {t('EntityMenu.remove')}
              </MenuItem>
              <MenuItem onClick={handleCopyUrl}>
                {t('EntityMenu.copyURL')}
              </MenuItem>
            </span>
          ) : (
            <span>
              <MenuItem onClick={handleRemoveTrack}>
                {t('EntityMenu.remove')}
              </MenuItem>
              <MenuItem onClick={handlePlayNextTrack}>
                {t('EntityMenu.playNext')}
              </MenuItem>
              <MenuItem onClick={openListDialog}>
                {t('EntityMenu.addToPlaylist')}
              </MenuItem>
              <MenuItem onClick={startRadioMode}>
                {t('EntityMenu.startRadioMode')}
              </MenuItem>
              <MenuItem onClick={handleCopyUrl}>
                {t('EntityMenu.copyURL')}
              </MenuItem>
            </span>
          )}
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default QueueEntityMenu;
