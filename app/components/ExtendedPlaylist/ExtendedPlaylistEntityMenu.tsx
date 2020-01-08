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
import Track from "../../dataLayer/models/Track";
import { Ref } from "mobx-keystone";

interface IPlaylistEntityMenuProps {
  trackRef: Ref<Track>;
  openListDialog: any;
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  display: block;
  margin-right: 16px;
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

const ExtendedPlaylistEntityMenu: React.FunctionComponent<IPlaylistEntityMenuProps> = props => {
  const { t } = useTranslation();

  const Store = ({ queue, playlists, app }: RootStore) => ({
    queue,
    playlists,
    app
  });

  const { queue, playlists, app } = useInject(Store);
  const playlist = playlists.getListById(app.selectedPlaylist);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleRemoveTrack = () => {
    playlist.removeTrackById(props.trackRef.id);
    setAnchorEl(null);
  };

  const _handlePlayNextTrack = () => {
    queue.addNextTrack(props.trackRef.current);
    setAnchorEl(null);
  };

  const _handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${props.trackRef.id}`
    );
  };

  return (
    <ClickAwayListener onClickAway={_handleClose}>
      <Container onClick={_handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="extended-playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          <MenuItem onClick={() => _handlePlayNextTrack()}>
            {t("EntityMenu.playNext")}
          </MenuItem>
          <MenuItem onClick={() => _handleRemoveTrack()}>
            {t("EntityMenu.remove")}
          </MenuItem>
          <MenuItem onClick={() => props.openListDialog()}>
            {t("EntityMenu.addToPlaylist")}
          </MenuItem>
          <MenuItem onClick={() => _handleCopyUrl()}>
            {t("EntityMenu.copyURL")}
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default ExtendedPlaylistEntityMenu;
