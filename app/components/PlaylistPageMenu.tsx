import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import withStyles from "@material-ui/styles/withStyles";
import React from "react";
import styled from "styled-components";
import useInject from "../hooks/useInject";
import { RootStoreModel } from "../dataLayer/stores/RootStore";

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

const PlaylistPageMenu: React.FunctionComponent<
  IPlaylistPageMenuProps
> = props => {
  const Store = ({ player, playlists, queue }: RootStoreModel) => ({
    player,
    playlists,
    queue
  });

  const { player, playlists, queue } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleLoadClick = () => {
    const playlist = playlists.getListById(props.id);

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
          <MenuItem onClick={() => _handleLoadClick()}>Load Playlist</MenuItem>
          <MenuItem onClick={() => _handleDeleteClick()}>
            Delete Playlist
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default PlaylistPageMenu;