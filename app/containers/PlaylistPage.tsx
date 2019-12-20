import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ControlPoint from "@material-ui/icons/ControlPoint";
import { withStyles } from "@material-ui/styles";
import Axios from "axios";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton";
import CustomTextareaDialog from "../components/Customs/CustomTextareaDialog";
import PlaylistWithMultiSongDialog from "../components/Playlist/PlaylistWithMultiSongDialog";
import PlaylistPageMenu from "../components/PlaylistPageMenu";
import ApiClient from "../dataLayer/api/ApiClient";
import Playlist from "../dataLayer/models/Playlist";
import Track from "../dataLayer/models/Track";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import { formattedDuration, removeControlCharacters } from "../helpers";
import useInject from "../hooks/useInject";
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
  const [addTracksOpen, setAddTracksOpen] = React.useState(false);
  // TODO: maybe re-use newPlaylistSongs ?
  const [songsToAdd, setSongsToAdd] = React.useState<{ Url: string }[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<
    string | undefined
  >(undefined);

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
        ApiClient.getPlaylists().then(({ data }) => {
          for (const playlist of data) {
            const oldPl = playlists.lists.find(list => list.id === playlist.Id);
            if (oldPl || playlist.tracks?.length !== oldPl.trackCount) continue;
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

  const _handleAddTracksClose = () => {
    setAddTracksOpen(false);
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

  const _onAddTracksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSongsToAdd(
      removeControlCharacters(event.target.value)
        .split(",")
        .map(url => ({
          Url: url
        }))
    );
  };

  const _addTracksToPlaylist = async () => {
    setAddTracksOpen(false);
    const playlist = playlists.getListById(selectedPlaylist);
    await playlist.addTracksByUrls(songsToAdd);
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
                    <PlaylistPageMenu
                      id={playlist.id}
                      handleAddTracksToList={() => setAddTracksOpen(true)}
                      setSelectedPlaylist={setSelectedPlaylist}
                    />
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
            <CustomButton
              onClick={() => _handleOnClick()}
              style={{
                width: "197px",
                height: "40px",
                position: "absolute",
                bottom: "56px",
                right: "24px"
              }}
            >
              {t("PlaylistPage.dialog.title")}
              <ControlPoint style={{ marginLeft: "8px" }} />
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
        <CustomTextareaDialog
          id="addTracksDialog"
          title={t("PlaylistPage.addTracks.title")}
          label={t("PlaylistPage.addTracks.label")}
          dialogText={t("PlaylistPage.addTracks.text")}
          open={addTracksOpen}
          handleClose={() => _handleAddTracksClose()}
          handleChange={_onAddTracksChange}
          handleConfirm={_addTracksToPlaylist}
          confirmButtonText={t("PlaylistPage.addTracks.confirmButton")}
          cancelButtonText={t("PlaylistPage.addTracks.cancelButton")}
          type="text"
          placeholder="https://www.youtube.com/watch?v=A3rvyaZFCN4"
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
              style={{
                width: "197px",
                height: "40px",
                position: "absolute",
                bottom: "56px",
                right: "24px"
              }}
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
