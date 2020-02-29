import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import withStyles from "@material-ui/core/styles/withStyles";
import { Ref } from "mobx-keystone";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ApiClient from "../../dataLayer/api/ApiClient";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";

interface IPlaylistEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: any;
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

const PlaylistEntityMenu: React.FunctionComponent<IPlaylistEntityMenuProps> = props => {
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
    player.currentPlaylist.current.removeTrackById(props.trackRef.current.id);
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

  const _addToQueue = () => {
    queue.addTrack(props.trackRef.current);
    setAnchorEl(null);
  };

  const _startRadioMode = async () => {
    // prepare
    queue.clear();
    player.toggleRadioMode();

    // set first track
    queue.addTrack(props.trackRef.current);
    player.setCurrentTrack(props.trackRef.current);
    PlayerInterop.setTrack(props.trackRef.current);

    // get related tracks
    const relatedTracks = await ApiClient.getRelatedTracks(
      props.trackRef.current.id
    );
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
          id="playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          <MenuItem onClick={() => _handlePlayNextTrack()}>
            {t("EntityMenu.playNext")}
          </MenuItem>
          <MenuItem onClick={() => _addToQueue()}>
            {t("EntityMenu.addToQueue")}
          </MenuItem>
          <MenuItem onClick={() => _handleRemoveTrack()} disabled={props.isReadOnly}>
            {t("EntityMenu.remove")}
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
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default PlaylistEntityMenu;
