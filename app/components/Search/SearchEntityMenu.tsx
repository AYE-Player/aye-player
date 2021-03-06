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
import { useStore } from "../StoreProvider";

interface ISearchEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: any;
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

const SearchEntityMenu: React.FunctionComponent<ISearchEntityMenuProps> = props => {
  const { t } = useTranslation();
  const { queue, trackCache, player } = useStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handlePlayNextTrack = () => {
    queue.addNextTrack(props.trackRef.current);
    setAnchorEl(null);
  };

  const _handleAddTrack = () => {
    queue.addTrack(props.trackRef.current);
    setAnchorEl(null);
  };

  const _handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${props.trackRef.current.id}`
    );
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
    <ClickAwayListener onClickAway={_handleClose} disableReactTree>
      <Container onClick={_handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          {props.isLivestream ? (
            <MenuItem onClick={() => _handleCopyUrl()}>
              {t("EntityMenu.copyURL")}
            </MenuItem>
          ) : (
            <span>
              <MenuItem onClick={() => _handlePlayNextTrack()}>
                {t("EntityMenu.playNext")}
              </MenuItem>
              <MenuItem onClick={() => _handleAddTrack()}>
                {t("EntityMenu.addToQueue")}
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

export default SearchEntityMenu;
