/* eslint-disable react/jsx-props-no-spreading */
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import withStyles from '@material-ui/core/styles/withStyles';
import { Ref } from 'mobx-keystone';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ApiClient from '../../dataLayer/api/ApiClient';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import { useStore } from '../StoreProvider';

interface ISearchEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: () => void;
  isLivestream: boolean;
}

const Container = styled.div`
  height: 24px;
  width: 24px;
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

const SearchEntityMenu: React.FunctionComponent<ISearchEntityMenuProps> = (
  props
) => {
  const { t } = useTranslation();
  const { queue, trackCache, player } = useStore();
  const { isLivestream, openListDialog, trackRef } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePlayNextTrack = () => {
    queue.addNextTrack(trackRef.current);
    setAnchorEl(null);
  };

  const handleAddTrack = () => {
    queue.addTrack(trackRef.current);
    setAnchorEl(null);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${trackRef.current.id}`
    );
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
        <MoreHorizIcon />
        <StyledMenu
          id="playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {isLivestream ? (
            <MenuItem onClick={handleCopyUrl}>
              {t('EntityMenu.copyURL')}
            </MenuItem>
          ) : (
            <span>
              <MenuItem onClick={handlePlayNextTrack}>
                {t('EntityMenu.playNext')}
              </MenuItem>
              <MenuItem onClick={handleAddTrack}>
                {t('EntityMenu.addToQueue')}
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

export default SearchEntityMenu;