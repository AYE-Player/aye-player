import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ControlPoint from "@material-ui/icons/ControlPoint";
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import shortid from "shortid";
import styled from "styled-components";
import CustomFormDialog from "../components/Customs/CustomFormDialog/CustomFormDialog";
import PlaylistPageMenu from "../components/PlaylistPageMenu";
import Playlist, { PlaylistModel } from "../dataLayer/models/Playlist";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import { formattedDuration } from "../helpers";
import useInject from "../hooks/useInject";
import { withStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";

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

/*const ListEntity = styled.div`
  margin: 8px 0;
  padding-bottom: 8px;
  align-items: center;
  display: flex;
  border-bottom: 1px solid #565f6c;
`;*/

const CreatePlaylist = styled.div`
  margin-top: 8px;
  display: flex;
  position: absolute;
  align-items: center;
  cursor: pointer;
  right: 10px;
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
  const [open, setOpen] = React.useState(false);

  const { t } = useTranslation();

  const Store = ({ playlists }: RootStoreModel) => ({
    playlists
  });

  const { playlists } = useInject(Store);

  const _createPlaylist = () => {
    setOpen(false);
    playlists.add(
      Playlist.create({
        name: newPlaylistName,
        tracks: [],
        id: shortid.generate()
      })
    );
  };

  const calculateTracksDuration = (playlist: PlaylistModel) => {
    let time = 0;

    for (const track of playlist.tracks) {
      time += track.duration;
    }

    return formattedDuration(time);
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

  return (
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
                    {playlist.tracks.length}
                  </StyledTableCell>
                  <StyledTableCell
                    align="right"
                    style={{
                      color: "#FBFBFB",
                      borderBottom: "1px solid #565f6c"
                    }}
                  >
                    {calculateTracksDuration(playlist)}
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
        <CustomFormDialog
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
        />
      </PlaylistContainer>
    </Container>
  );
};

export default observer(PlaylistPage);
