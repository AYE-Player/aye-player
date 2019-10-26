import React from "react";
import useInject from "../hooks/useInject";
import ControlPoint from "@material-ui/icons/ControlPoint";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Playlist from "../dataLayer/models/Playlist";
import CustomFormDialog from "../components/Customs/CustomFormDialog/CustomFormDialog";
import shortid from "shortid";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div``;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
`;

const ListEntity = styled.div`
  margin: 8px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #565f6c;
`;

const CreatePlaylist = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
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
        {playlists.lists.map(playlist => (
          <ListEntity key={playlist.id}>
            <Link to={`/playlist/${playlist.id}`}>
              {playlist.name}
            </Link>
          </ListEntity>
        ))}
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

export default PlaylistPage;
