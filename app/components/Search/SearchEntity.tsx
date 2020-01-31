import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import CustomFormDialog from "../Customs/CustomFormDialog";
import CustomListDialog from "../Customs/CustomListDialog";
import SnackMessage from "../Customs/SnackMessage";
import SearchEntityMenu from "./SearchEntityMenu";
import { Ref } from "mobx-keystone";

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  onDoubleClick: Function;
}

const Container = styled.div<any>`
  height: 72px;
  width: calc(100% - 16px);
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover > div {
    color: #f0ad4e;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  padding-left: 8px;
  width: 100%;
`;

// TODO: FIX scrolltext, to only scroll if it really goes out of the designated zone
const Title = styled.div<any>`
  padding-right: 16px;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  ${(props: any) => {
    if (props.length >= 42) {
      return `div {

        transform: translateX(0);
        transition-timing-function: linear;
        transition-duration: ${
          props.length === 42 ? "1s" : props.length <= 55 ? "2s" : "3s"
        };
      }
      :hover div {
        transform: translateX(calc(300px - 100%)) translate3d(0,0,0);
      }`;
    }
  }}
`;

const Duration = styled.div`
  margin-left: 16px;
`;

const TrackImageContainer = styled.div`
  width: 48px;
  height: 48px;
  margin-right: 32px;
  border-radius: 24px;
  overflow: hidden;
`;

const TrackImage = styled.img`
  position: relative;
  width: 64px;
  height: 48px;
  transform: scale(1.4) translate(-5px);
`;

const SearchEntity: React.FunctionComponent<IProps> = props => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const Store = ({ playlists }: RootStore) => ({
    playlists
  });

  const { playlists } = useInject(Store);

  const [open, setOpen] = React.useState(false);
  const [
    openCreatePlaylistDialog,
    setOpenCreatePlaylistDialog
  ] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState("");

  const _handleClickOpen = () => {
    setOpen(true);
  };

  const _handleClose = (id: string, givenTrack: Track) => {
    setOpen(false);
    const playlist = playlists.getListById(id);
    try {
      if (playlist.tracks.find(track => track.current.id === givenTrack.id)) {
        enqueueSnackbar("", {
          content: key => (
            <SnackMessage
              id={key}
              variant="warning"
              message={t("SearchEntity.trackExists")}
            />
          )
        });
      } else {
        playlist.addTrack(givenTrack);
        enqueueSnackbar("", {
          content: key => (
            <SnackMessage
              id={key}
              variant="info"
              message={`${t("SearchEntity.trackAdded")} ${playlist.name}`}
            />
          )
        });
      }
    } catch (error) {
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("Error.couldNotAddTrack")} />
        )
      });
    }
  };

  const _createListItem = (value: string) => {
    setOpen(false);
    setOpenCreatePlaylistDialog(true);
  };

  const _createPlaylist = async () => {
    setOpenCreatePlaylistDialog(false);
    await playlists.createListWithSongs(newPlaylistName, [
      { Url: `https://www.youtube.com/watch?v${props.track.current.id}` }
    ]);

    enqueueSnackbar("", {
      content: key => (
        <SnackMessage
          id={key}
          variant="info"
          message={`${t("SearchEntity.createdAndAdded")}`}
        />
      )
    });
  };

  const _onPlaylistNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPlaylistName(event.target.value);
  };

  const _handlePlaylistCreateDialogClose = () => {
    setOpenCreatePlaylistDialog(false);
  };

  const _handlePlaylistSelectDialogClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <TrackInfoContainer
        onDoubleClick={() => props.onDoubleClick(props.track)}
      >
        <TrackImageContainer>
          <TrackImage
            src={`https://img.youtube.com/vi/${props.track.current.id}/default.jpg`}
          />
        </TrackImageContainer>
        <Title length={props.track.current.title.length}>
          <div style={{ display: "inline-block" }}>
            {props.track.current.title}
          </div>
        </Title>
        <Duration>{props.duration}</Duration>
      </TrackInfoContainer>
      <SearchEntityMenu
        trackRef={props.track}
        openListDialog={_handleClickOpen}
        isLivestream={props.track.current.isLivestream}
      />
      <CustomListDialog
        dialogTitle={t("SearchEntity.selectPlaylist")}
        open={open}
        handleClose={() => _handlePlaylistSelectDialogClose()}
        track={props.track}
        onSelect={_handleClose}
        createListItem={_createListItem}
        listItemText={t("SearchEntity.createListText")}
        options={playlists.lists.map(list => {
          return {
            name: list.name,
            id: list.id
          };
        })}
      />
      <CustomFormDialog
        id="createPlaylistDialog"
        title={t("PlaylistPage.dialog.title")}
        label={t("PlaylistPage.dialog.label")}
        dialogText={t("PlaylistPage.dialog.text")}
        open={openCreatePlaylistDialog}
        handleClose={() => _handlePlaylistCreateDialogClose()}
        handleConfirm={() => _createPlaylist()}
        handleChange={_onPlaylistNameChange}
        confirmButtonText={t("PlaylistPage.dialog.confirmButton")}
        cancelButtonText={t("PlaylistPage.dialog.cancelButton")}
        type="text"
      />
    </Container>
  );
};

export default observer(SearchEntity);
