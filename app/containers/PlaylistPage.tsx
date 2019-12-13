import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ControlPoint from "@material-ui/icons/ControlPoint";
import { withStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton";
import PlaylistPageMenu from "../components/PlaylistPageMenu";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import { formattedDuration, removeControlCharacters } from "../helpers";
import useInject from "../hooks/useInject";
import Axios from "axios";
import Track from "../dataLayer/models/Track";
import Playlist from "../dataLayer/models/Playlist";
import PlaylistWithMultiSongDialog from "../components/Playlist/PlaylistWithMultiSongDialog";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  height: 100%;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  height: 100%;
`;

const CreatePlaylist = styled.div`
  margin-top: 8px;
  display: flex;
  position: absolute;
  align-items: center;
  cursor: pointer;
  right: 16px;
  bottom: 56px;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 128px);
`;

const StyledTableCell = withStyles({
  body: {
    color: "#fbfbfb"
  }
})(TableCell);

const PlaylistPage: React.FunctionComponent = () => {
  const [newPlaylistName, setNewPlaylistName] = React.useState("");
  const [newPlaylistSongs, setNewPlaylistSongs] = React.useState<
    { Url: string }[]
  >([]);
  const [open, setOpen] = React.useState(false);

  const { t } = useTranslation();

  const Store = ({ playlists, trackCache }: RootStoreModel) => ({
    playlists,
    trackCache
  });

  const { playlists, trackCache } = useInject(Store);

  useEffect(() => {
    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();

    try {
      const token = localStorage.getItem("token");
      if (token) {
        Axios.get("https://api.aye-player.de/v1/playlists", {
          headers: {
            "x-access-token": token
          }
        }).then(({ data }) => {
          for (const playlist of data) {
            if (playlists.lists.find(list => list.id === playlist.Id)) return;
            const pl = Playlist.create({
              id: playlist.Id,
              name: playlist.Name,
              tracks: []
            });
            if (playlist.tracks) {
              for (const track of playlist.tracks) {
                const tr = Track.create({
                  id: track.Id,
                  title: track.Title,
                  duration: track.Duration
                });
                if (!trackCache.getTrackById(track.id)) {
                  trackCache.add(tr);
                }
                pl.addTrack(tr);
              }
            }

            playlists.add(pl);
          }
        });
      }
    } catch (error) {
      AyeLogger.player(
        `[PlaylistPage] Error retrieving Playlists ${error}`,
        LogType.ERROR
      );
    }

    return () => {
      source.cancel();
    };
  }, []);

  const _createPlaylist = async () => {
    setOpen(false);
    if (newPlaylistSongs.length > 0) {
      await playlists.createListWithSongs(newPlaylistName, newPlaylistSongs);
    } else {
      await playlists.createList(newPlaylistName);
    }
  };

  const _handleOnClick = () => {
    setOpen(true);
  };

  const _handleClose = () => {
    setOpen(false);
  };

  const _onPlaylistNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPlaylistName(event.target.value);
  };

  const _onPlaylistSongsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPlaylistSongs(
      removeControlCharacters(event.target.value)
        .split(",")
        .map(url => ({
          Url: url
        }))
    );
  };

  const renderPlaylists = () => (
    <Container>
      <Header>Playlists</Header>
      <PlaylistContainer>
        <ScrollContainer>
          <Table
            aria-label="playlist table"
            style={{ minWidth: "400px" }}
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    color: "#FBFBFB",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                >
                  {t("PlaylistPage.name")}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: "#FBFBFB",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                >
                  {t("PlaylistPage.tracks")}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: "#FBFBFB",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                >
                  {t("PlaylistPage.length")}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: "#FBFBFB",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playlists.lists.map(playlist => (
                <TableRow key={playlist.id}>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    style={{ borderBottom: "1px solid #565f6c" }}
                  >
                    <Link
                      to={`/playlist/${playlist.id}`}
                      style={{ color: "#FBFBFB" }}
                    >
                      {playlist.name}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell
                    align="right"
                    style={{
                      color: "#FBFBFB",
                      borderBottom: "1px solid #565f6c"
                    }}
                  >
                    {playlist.trackCount}
                  </StyledTableCell>
                  <StyledTableCell
                    align="right"
                    style={{
                      color: "#FBFBFB",
                      borderBottom: "1px solid #565f6c"
                    }}
                  >
                    {formattedDuration(playlist.duration)}
                  </StyledTableCell>
                  <StyledTableCell
                    style={{
                      color: "#FBFBFB",
                      borderBottom: "1px solid #565f6c"
                    }}
                  >
                    <PlaylistPageMenu id={playlist.id} />
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
        <PlaylistWithMultiSongDialog
          id="createPlaylistDialog"
          title={t("PlaylistPage.dialog.title")}
          label={t("PlaylistPage.dialog.label")}
          button={
            <CreatePlaylist onClick={() => _handleOnClick()}>
              {t("PlaylistPage.dialog.title")}
              <ControlPoint style={{ marginLeft: "10px" }} />
            </CreatePlaylist>
          }
          dialogText={t("PlaylistPage.dialog.text")}
          open={open}
          handleClose={() => _handleClose()}
          handleConfirm={() => _createPlaylist()}
          handleChange={_onPlaylistNameChange}
          confirmButtonText={t("PlaylistPage.dialog.confirmButton")}
          cancelButtonText={t("PlaylistPage.dialog.cancelButton")}
          type="text"
          textField={{
            placeholder: "https://www.youtube.com/watch?v=A3rvyaZFCN4",
            label: t("PlaylistPage.dialog.textField.label"),
            dialogText: t("PlaylistPage.dialog.textField.dialogText")
          }}
          handleSongsChange={_onPlaylistSongsChange}
        />
      </PlaylistContainer>
    </Container>
  );

  return playlists.lists.length > 0 ? (
    renderPlaylists()
  ) : (
    <Container>
      <Header>Playlists</Header>
      <PlaylistContainer>
        {t("PlaylistPage.noPlaylist")}
        <PlaylistWithMultiSongDialog
          id="createPlaylistDialog"
          title={t("PlaylistPage.dialog.title")}
          label={t("PlaylistPage.dialog.label")}
          button={
            <CustomButton
              onClick={() => _handleOnClick()}
              style={{ width: "250px", marginTop: "16px" }}
            >
              {t("PlaylistPage.dialog.title")}
              <ControlPoint style={{ marginLeft: "16px" }} />
            </CustomButton>
          }
          dialogText={t("PlaylistPage.dialog.text")}
          open={open}
          handleClose={() => _handleClose()}
          handleConfirm={() => _createPlaylist()}
          handleChange={_onPlaylistNameChange}
          confirmButtonText={t("PlaylistPage.dialog.confirmButton")}
          cancelButtonText={t("PlaylistPage.dialog.cancelButton")}
          type="text"
          textField={{
            placeholder: "https://www.youtube.com/watch?v=A3rvyaZFCN4",
            label: t("PlaylistPage.dialog.textField.label"),
            dialogText: t("PlaylistPage.dialog.textField.dialogText")
          }}
          handleSongsChange={_onPlaylistSongsChange}
        />
      </PlaylistContainer>
    </Container>
  );
};

export default observer(PlaylistPage);
