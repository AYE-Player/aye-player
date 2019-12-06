import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import withStyles from "@material-ui/styles/withStyles";
import axios from "axios";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Track from "../dataLayer/models/Track";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { getSnapshot } from "mobx-state-tree";

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
  const playerElement = document.querySelector("#embedded-player") as any;

  const Store = ({ player, playlists, queue, trackCache }: RootStoreModel) => ({
    player,
    playlists,
    queue,
    trackCache
  });

  const { player, playlists, queue, trackCache } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleLoadClick = async () => {
    const playlist = playlists.getListById(props.id);

    if (playlist.tracks.length === 0) {
      const { data: tracks } = await axios.get(
        `https://api.aye-player.de/playlists/v1/${props.id}/songs?skip=0&take=20`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token")
          }
        }
      );
      console.log("TRACKS",tracks);
      for (const track of tracks) {
        const tr = Track.create({
          id: track.Id,
          duration: track.Duration,
          title: track.Title,
          isLivestream: track.IsLivestream
        });
        if (!trackCache.tracks.find(t => t.id === tr.id)) {
          trackCache.add(tr);
        }
        playlist.addLoadedTrack(tr);
      }
    }

    queue.clear();
    queue.addTracks(playlist.tracks);
    player.setCurrentPlaylist(playlist);
    player.playTrack(playlist.tracks[0]);
    playerElement.contentWindow.postMessage(
      {
        type: "playTrack",
        track: getSnapshot(playlist.tracks[0])
      },
      "https://player.aye-player.de"
    );
    setAnchorEl(null);
  };

  const _handleDeleteClick = () => {
    setAnchorEl(null);
    const playlist = playlists.getListById(props.id);
    playlists.remove(playlist.id);
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
            disabled={playlists.getListById(props.id).trackCount === 0}
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
