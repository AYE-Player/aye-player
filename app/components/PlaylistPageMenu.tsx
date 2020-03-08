import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import withStyles from "@material-ui/core/styles/withStyles";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ApiClient from "../dataLayer/api/ApiClient";
import PlayerInterop from "../dataLayer/api/PlayerInterop";
import Playlist from "../dataLayer/models/Playlist";
import Track from "../dataLayer/models/Track";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";
import SnackMessage from "./Customs/SnackMessage";

interface IPlaylistPageMenuProps {
  id: string;
  handleAddTracksToList: any;
  setSelectedPlaylist: React.Dispatch<React.SetStateAction<string>>;
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
    color: "#f2f5f4"
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
  const { enqueueSnackbar } = useSnackbar();
  PlayerInterop.init();

  const Store = ({ player, playlists, queue, trackCache }: RootStore) => ({
    player,
    playlists,
    queue,
    trackCache
  });

  const { player, playlists, queue, trackCache } = useInject(Store);
  const playlist = playlists.getListById(props.id);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleLoadClick = async () => {
    try {
      if (playlist.tracks.length === 0) {
        await _getTracksOfPlaylist(playlist);
      }

      queue.clear();
      queue.addTracks(playlist.tracks.map(track => track.current));
      player.setCurrentPlaylist(playlist);
      player.playTrack(playlist.tracks[0].current);
      PlayerInterop.playTrack(playlist.tracks[0].current);
      setAnchorEl(null);
    } catch (error) {
      AyeLogger.player(
        `Error loading PlaylistTracks ${JSON.stringify(error, null, 2)}`
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("Error.getPlaylists")}
          />
        )
      });
    }
  };

  const _handleDeleteClick = async () => {
    try {
      setAnchorEl(null);
      await playlists.remove(playlist.id, playlist.isReadonly);
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="success"
            message={t("Playlist.deleted")}
          />
        )
      });
    } catch (error) {
      AyeLogger.player(
        `Error deleting Playlist ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("Playlist.couldNotDelete")}
          />
        )
      });
    }
  };

  const _handleAddPlaylistToQueueClick = async () => {
    try {
      if (playlist.tracks.length === 0) {
        await _getTracksOfPlaylist(playlist);
      }

      queue.addTracks(playlist.tracks.map(track => track.current));
    } catch (error) {
      AyeLogger.player(
        `Error loading PlaylistTracks ${JSON.stringify(error, null, 2)}`
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("Error.getPlaylists")}
          />
        )
      });
    }
  };

  const _getTracksOfPlaylist = async (playlist: Playlist) => {
    const tracks = await ApiClient.getTracksFromPlaylist(
      playlist.id,
      playlist.trackCount
    );
    for (const track of tracks) {
      const tr = new Track({
        id: track.Id,
        duration: track.Duration,
        title: track.Title
      });
      if (!trackCache.tracks.find(t => t.id === tr.id)) {
        trackCache.add(tr);
      }
      playlist.addLoadedTrack(tr);
    }
  };

  const _handleSharePlaylist = async () => {
    navigator.clipboard.writeText(`aye://playlist/${props.id}`);
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
            disabled={playlist.trackCount === 0}
          >
            {t("EntityMenu.loadPlaylist")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              props.setSelectedPlaylist(props.id);
              props.handleAddTracksToList();
            }}
            disabled={playlist.isReadonly}
          >
            {t("EntityMenu.addTracksToPlaylist")}
          </MenuItem>
          <MenuItem
            onClick={() => _handleAddPlaylistToQueueClick()}
            disabled={playlist.trackCount === 0}
          >
            {t("EntityMenu.addPlaylistToQueue")}
          </MenuItem>
          <MenuItem
            onClick={() => _handleSharePlaylist()}
            disabled={playlist.isReadonly}
          >
            {t("EntityMenu.sharePlaylist")}
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
