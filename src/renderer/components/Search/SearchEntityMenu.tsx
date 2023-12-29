/* eslint-disable react/jsx-props-no-spreading */
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ClickAwayListener, MenuItem } from '@mui/material';
import { Ref } from 'mobx-keystone';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import { getRelatedTracks } from '../../dataLayer/api/fetchers';
import Track from '../../dataLayer/models/Track';
import AyeMenu from '../Customs/AyeMenu';
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

const SearchEntityMenu: React.FunctionComponent<ISearchEntityMenuProps> = (
  props,
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
      `https://www.youtube.com/watch?v=${trackRef.current.id}`,
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

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container onClick={handleClick}>
        <MoreHorizIcon />
        <AyeMenu
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
        </AyeMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default SearchEntityMenu;
