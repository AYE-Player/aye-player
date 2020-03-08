import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ControlPoint from "@material-ui/icons/ControlPoint";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import CustomButton from "../components/Customs/CustomButton";
import CustomTextareaDialog from "../components/Customs/CustomTextareaDialog";
import SnackMessage from "../components/Customs/SnackMessage";
import Divider from "../components/Divider";
import PlaylistWithMultiSongDialog from "../components/Playlist/PlaylistWithMultiSongDialog";
import PlaylistPageMenu from "../components/PlaylistPageMenu";
import routes from "../constants/routes.json";
import ApiClient from "../dataLayer/api/ApiClient";
import Playlist from "../dataLayer/models/Playlist";
import Track from "../dataLayer/models/Track";
import RootStore from "../dataLayer/stores/RootStore";
import { formattedDuration, removeControlCharacters } from "../helpers";
import useInject from "../hooks/useInject";
import AyeLogger from "../modules/AyeLogger";
import { LogType } from "../types/enums";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

// Im not 100% sure, why we need the 42px here,
// but it looks good now
const Container = styled.div`
  height: calc(100% - 42px);
  width: 100%;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 72px);
`;

const PlaylistPage: React.FunctionComponent = () => {
  const [newPlaylistName, setNewPlaylistName] = React.useState("");
  const [newPlaylistSongs, setNewPlaylistSongs] = React.useState<
    { Url: string }[]
  >([]);
  const [open, setOpen] = React.useState(false);
  const [addTracksOpen, setAddTracksOpen] = React.useState(false);
  const [songsToAdd, setSongsToAdd] = React.useState<{ Url: string }[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Maybe<string>>(
    undefined
  );

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const Store = ({ playlists, trackCache, user }: RootStore) => ({
    playlists,
    trackCache,
    user
  });

  const { playlists, trackCache, user } = useInject(Store);

  useEffect(() => {
    const controller = new AbortController();

    try {
      const token = localStorage.getItem("token");
      if (token) {
        ApiClient.getPlaylists().then(data => {
          for (const playlist of data) {
            const oldPl = playlists.lists.find(list => list.id === playlist.Id);
            if (
              oldPl ||
              (oldPl && playlist.Tracks?.length !== oldPl.trackCount)
            )
              continue;
            const pl = new Playlist({
              id: playlist.Id,
              name: playlist.Name,
              trackCount: playlist.SongsCount,
              duration: playlist.Duration,
              isReadonly: playlist.IsReadonly,
              tracks: []
            });
            if (playlist.Tracks) {
              for (const track of playlist.Tracks) {
                const tr = new Track({
                  id: track.Id,
                  title: track.Title,
                  duration: track.Duration
                });
                if (!trackCache.getTrackById(track.Id)) {
                  trackCache.add(tr);
                }
                pl.addLoadedTrack(tr);
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
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t("Error.getPlaylists")}`}
          />
        )
      });
    }

    return () => {
      controller.abort();
    };
  }, []);

  const _createPlaylist = async () => {
    setOpen(false);
    try {
      if (newPlaylistSongs.length > 0) {
        await playlists.createListWithSongs(newPlaylistName, newPlaylistSongs);
      } else {
        await playlists.createList(newPlaylistName);
      }
    } catch (error) {
      AyeLogger.player(
        `Error creating Playlist ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t("Playlist.couldNotCreate")}`}
          />
        )
      });
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
    const playlist = playlists.getListById(selectedPlaylist);
    try {
      setAddTracksOpen(false);
      await playlist.addTracksByUrls(songsToAdd);
    } catch (error) {
      AyeLogger.player(
        `Error adding tracks to playlist ${playlist.id} ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t("Error.couldNotAddTrack")}`}
          />
        )
      });
    }
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
                    color: "#f2f5f4",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                >
                  {t("PlaylistPage.name")}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: "#f2f5f4",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                >
                  {t("PlaylistPage.tracks")}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: "#f2f5f4",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                >
                  {t("PlaylistPage.length")}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: "#f2f5f4",
                    backgroundColor: "#3d4653",
                    borderBottom: "none"
                  }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playlists.lists.map(playlist => (
                <TableRow key={playlist.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      to={`/playlist/${playlist.id}`}
                      style={{ color: "#f2f5f4", opacity: 1 }}
                    >
                      {playlist.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right" style={{ color: "#f2f5f4" }}>
                    {playlist.trackCount}
                  </TableCell>
                  <TableCell align="right" style={{ color: "#f2f5f4" }}>
                    {formattedDuration(playlist.duration)}
                  </TableCell>
                  <TableCell style={{ color: "#f2f5f4" }}>
                    <PlaylistPageMenu
                      id={playlist.id}
                      handleAddTracksToList={() => setAddTracksOpen(true)}
                      setSelectedPlaylist={setSelectedPlaylist}
                    />
                  </TableCell>
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
                width: "206px",
                height: "40px",
                position: "absolute",
                bottom: "56px",
                right: "16px"
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
        {user.isAuthenticated ? (
          <>
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
            />{" "}
          </>
        ) : (
          <>
            {t("PlaylistPage.notAuthenticated")}
            <Divider size={2} />
            <CustomButton
              onClick={() =>
                (window.location.href = `${
                  window.location.href.split("#/")[0]
                }#${routes.REGISTER}`)
              }
              style={{
                width: "200px"
              }}
            >
              {t("PlaylistPage.createAccount")}
            </CustomButton>
            <Divider size={2} />
            <CustomButton
              onClick={() =>
                (window.location.href = `${
                  window.location.href.split("#/")[0]
                }#${routes.LOGIN}`)
              }
              style={{
                width: "200px"
              }}
            >
              {t("PlaylistPage.login")}
            </CustomButton>
          </>
        )}
      </PlaylistContainer>
    </Container>
  );
};

export default observer(PlaylistPage);
