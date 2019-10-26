import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ControlPoint from "@material-ui/icons/ControlPoint";
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
import { observer } from "mobx-react-lite";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  height: calc(100% - 40px);
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
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
  max-height: calc(100% - 40px);
`;

const PlaylistPage: React.FunctionComponent = () => {
  const [newPlaylistName, setNewPlaylistName] = React.useState("");
  const [open, setOpen] = React.useState(false);

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
            aria-label="simple table"
            style={{ minWidth: "400px" }}
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell
                  style={{ color: "white", backgroundColor: "#3d4653" }}
                >
                  Name
                </TableCell>
                <TableCell
                  align="right"
                  style={{ color: "white", backgroundColor: "#3d4653" }}
                >
                  Tracks
                </TableCell>
                <TableCell
                  align="right"
                  style={{ color: "white", backgroundColor: "#3d4653" }}
                >
                  Length
                </TableCell>
                <TableCell
                  align="right"
                  style={{ color: "white", backgroundColor: "#3d4653" }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playlists.lists.map(playlist => (
                <TableRow
                  key={playlist.id}
                  style={{ borderBottom: "1px solid #565f6c" }}
                >
                  <TableCell component="th" scope="row">
                    <Link
                      to={`/playlist/${playlist.id}`}
                      style={{ color: "white" }}
                    >
                      {playlist.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right" style={{ color: "white" }}>
                    {playlist.tracks.length}
                  </TableCell>
                  <TableCell align="right" style={{ color: "white" }}>
                    {calculateTracksDuration(playlist)}
                  </TableCell>
                  <TableCell style={{ color: "white" }}>
                    <PlaylistPageMenu id={playlist.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
        <CustomFormDialog
          id="createPlaylistDialog"
          title="Create Playlist"
          label="Playlist Name"
          button={
            <CreatePlaylist onClick={() => _handleOnClick()}>
              Create Playlist
              <ControlPoint style={{ marginLeft: "10px" }} />
            </CreatePlaylist>
          }
          dialogText="Enter the name of your new playlist"
          open={open}
          handleClose={() => _handleClose()}
          handleConfirm={() => _createPlaylist()}
          handleChange={_onPlaylistNameChange}
          confirmButtonText="Create"
          cancelButtonText="Cancel"
          type="text"
        />
      </PlaylistContainer>
    </Container>
  );
};

export default observer(PlaylistPage);
