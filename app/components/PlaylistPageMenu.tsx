import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import withStyles from "@material-ui/styles/withStyles";
import React from "react";
import styled from "styled-components";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { useTranslation } from "react-i18next";

interface IPlaylistPageMenuProps {
  id: string;
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
    backgroundColor: "#3D4653",
    boxShadow:
      "0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)",
    color: "#FBFBFB"
  }
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "top",
      horizontal: "center"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right"
    }}
    {...props}
  />
));

const PlaylistPageMenu: React.FunctionComponent<IPlaylistPageMenuProps> = props => {
  const { t } = useTranslation();

  const Store = ({ player, playlists, queue }: RootStoreModel) => ({
    player,
    playlists,
    queue
  });

  const { player, playlists, queue } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleLoadClick = () => {
    const playlist = playlists.getListById(props.id);

    if (playlist.tracks.length === 0) return;

    queue.clear();
    queue.addTracks(playlist.tracks);
    player.setCurrentPlaylist(playlist);
    player.playTrack(playlist.tracks[0]);
    setAnchorEl(null);
  };

  const _handleDeleteClick = () => {
    setAnchorEl(null);
    const playlist = playlists.getListById(props.id);
    playlists.removePlaylist(playlist.id);
  };

  return (
    <ClickAwayListener onClickAway={_handleClose}>
      <Container onClick={_handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          <MenuItem
            onClick={() => _handleLoadClick()}
            disabled={playlists.getListById(props.id).tracks.length === 0}
          >
            {t("EntityMenu.loadPlaylist")}
          </MenuItem>
          <MenuItem onClick={() => _handleDeleteClick()}>
            {t("EntityMenu.deletePlaylist")}
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default PlaylistPageMenu;
