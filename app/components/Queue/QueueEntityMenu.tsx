import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import withStyles from "@material-ui/styles/withStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import { Ref } from "mobx-keystone";
import Track from "../../dataLayer/models/Track";
import ApiClient from "../../dataLayer/api/ApiClient";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";

interface IQueueEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: any;
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
    backgroundColor: "#3D4653",
    boxShadow:
      "0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)",
    color: "#f2f5f4"
  }
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "top",
      horizontal: "left"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right"
    }}
    {...props}
  />
));

const QueueEntityMenu: React.FunctionComponent<IQueueEntityMenuProps> = props => {
  const { t } = useTranslation();

  const Store = ({ queue, player, trackCache }: RootStore) => ({
    queue,
    player,
    trackCache
  });

  const { queue, player, trackCache } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleRemoveTrack = () => {
    queue.removeTrack(props.trackRef.current.id);
    setAnchorEl(null);
  };

  const _handlePlayNextTrack = () => {
    queue.addNextTrack(props.trackRef.current);
    setAnchorEl(null);
  };

  const _handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${props.trackRef.current.id}`
    );
  };

  const _startRadioMode = async () => {
    // we need to copy the track here, because we will clear the queue an remove the ref
    const trackCopy = props.trackRef.current;
    // prepare
    queue.clear();
    player.toggleRadioMode();

    // set first track
    queue.addTrack(trackCopy);
    player.setCurrentTrack(trackCopy);
    PlayerInterop.setTrack(trackCopy);

    // get related tracks
    const relatedTracks = await ApiClient.getRelatedTracks(trackCopy.id);
    const tracks: Track[] = [];
    for (const trk of relatedTracks) {
      let track: Track;
      if (!trackCache.getTrackById(trk.Id)) {
        track = new Track({
          id: trk.Id,
          title: trk.Title,
          duration: trk.Duration
        });
        trackCache.add(track);
      } else {
        track = trackCache.getTrackById(trk.Id);
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
    <ClickAwayListener onClickAway={_handleClose}>
      <Container onClick={_handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="queue-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          {props.isLivestream ? (
            <span>
              <MenuItem onClick={() => _handleRemoveTrack()}>
                {t("EntityMenu.remove")}
              </MenuItem>
              <MenuItem onClick={() => _handleCopyUrl()}>
                {t("EntityMenu.copyURL")}
              </MenuItem>
            </span>
          ) : (
            <span>
              <MenuItem onClick={() => _handleRemoveTrack()}>
                {t("EntityMenu.remove")}
              </MenuItem>
              <MenuItem onClick={() => _handlePlayNextTrack()}>
                {t("EntityMenu.playNext")}
              </MenuItem>
              <MenuItem onClick={() => props.openListDialog()}>
                {t("EntityMenu.addToPlaylist")}
              </MenuItem>
              <MenuItem onClick={() => _startRadioMode()}>
                {t("EntityMenu.startRadioMode")}
              </MenuItem>
              <MenuItem onClick={() => _handleCopyUrl()}>
                {t("EntityMenu.copyURL")}
              </MenuItem>
            </span>
          )}
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default QueueEntityMenu;
