import DragHandleIcon from "@material-ui/icons/DragHandle";
import { Ref } from "mobx-keystone";
import { useSnackbar } from "notistack";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Track from "../../dataLayer/models/Track";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import CustomFormDialog from "../Customs/CustomFormDialog";
import CustomListDialog from "../Customs/CustomListDialog";
import SnackMessage from "../Customs/SnackMessage";
import ScrollingText from "../ScrollingText";
import { useStore } from "../StoreProvider";
import PlaylistEntityMenu from "./PlaylistEntityMenu";

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  active: boolean;
  isReadonly: boolean;
  onClick: Function;
}

interface ITrackInfoContainerProps {
  active: boolean;
}

const DragHandle = styled(DragHandleIcon)`
  opacity: 0;
  cursor: grab;
  z-index: 10;
`;

const Container = styled.div`
  height: 48px;
  width: calc(100% - 8px);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover ${DragHandle} {
    opacity: 1;
  }
  &:hover > div {
    color: #f0ad4e;
  }
`;

const TrackInfoContainer = styled.div<ITrackInfoContainerProps>`
  display: inline-block;
  cursor: pointer;
  width: 224px;
  padding: 8px 0;
  padding-left: 8px;
  color: ${(props) => (props.active ? "#f0ad4e" : "")};
`;

const Title = styled.div`
  white-space: nowrap;
  position: relative;
  z-index: 10;
`;

const Duration = styled.div`
  font-size: 12px;
`;

const PlaylistEntity: React.FunctionComponent<IProps> = (props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { playlists } = useStore();

  const [open, setOpen] = React.useState(false);
  const [
    openCreatePlaylistDialog,
    setOpenCreatePlaylistDialog,
  ] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState("");

  const _handleClickOpen = () => {
    setOpen(true);
  };

  const _handleClose = async (id: string, givenTrack: Track) => {
    setOpen(false);
    const playlist = playlists.getListById(id);
    try {
      if (playlist.tracks.find((track) => track.current.id === givenTrack.id)) {
        enqueueSnackbar("", {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="warning"
              message={t("SearchEntity.trackExists")}
            />
          ),
          disableWindowBlurListener: true,
        });
      } else {
        await playlist.addTrack(givenTrack);
        enqueueSnackbar("", {
          content: (key) => (
            <SnackMessage
              id={key}
              variant="info"
              message={`${t("SearchEntity.trackAdded")} ${playlist.name}`}
            />
          ),
          disableWindowBlurListener: true,
        });
      }
    } catch (error) {
      AyeLogger.player(
        `Error adding track to playlist ${playlist.id} ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("Error.couldNotAddTrack")}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const _createListItem = (value: string) => {
    setOpen(false);
    setOpenCreatePlaylistDialog(true);
  };

  const _createPlaylist = async () => {
    setOpenCreatePlaylistDialog(false);
    try {
      await playlists.createListWithSongs(newPlaylistName, [
        { Url: `https://www.youtube.com/watch?v${props.track.current.id}` },
      ]);

      enqueueSnackbar("", {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="info"
            message={`${t("createdAndAdded")}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    } catch (error) {
      AyeLogger.player(
        `[createListWithSongs] Error creating playlist ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t("Playlist.couldNotCreate")}`}
          />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const _onPlaylistNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPlaylistName(event.target.value);
  };

  const _handleCreatePlaylistDialogClose = () => {
    setOpenCreatePlaylistDialog(false);
  };

  const _handlePlaylistSelectDialogClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Draggable
        key={props.index}
        draggableId={props.track.current.id}
        index={props.index}
      >
        {(provided) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DragHandle fontSize="small" />
            <TrackInfoContainer
              active={props.active || false}
              onClick={() => props.onClick(props.track)}
              id={"track_" + props.track.current.id + "-" + props.index}
            >
              <ScrollingText
                scrollId={"track_" + props.track.current.id + "-" + props.index}
              >
                <Title>{props.track.current.title}</Title>
              </ScrollingText>
              <Duration>{props.duration}</Duration>
            </TrackInfoContainer>
            <PlaylistEntityMenu
              trackRef={props.track}
              openListDialog={_handleClickOpen}
              isReadOnly={props.isReadonly}
            />
          </Container>
        )}
      </Draggable>
      <CustomListDialog
        dialogTitle={t("SearchEntity.selectPlaylist")}
        open={open}
        handleClose={() => _handlePlaylistSelectDialogClose()}
        track={props.track}
        onSelect={_handleClose}
        createListItem={_createListItem}
        listItemText={t("SearchEntity.createListText")}
        options={playlists.lists
          .filter((list) => !list.isReadonly)
          .map((list) => {
            return {
              name: list.name,
              id: list.id,
            };
          })}
      />
      <CustomFormDialog
        id="createPlaylistDialog"
        title={t("PlaylistPage.dialog.title")}
        label={t("PlaylistPage.dialog.label")}
        dialogText={t("PlaylistPage.dialog.text")}
        open={openCreatePlaylistDialog}
        handleClose={() => _handleCreatePlaylistDialogClose()}
        handleConfirm={() => _createPlaylist()}
        handleChange={_onPlaylistNameChange}
        confirmButtonText={t("PlaylistPage.dialog.confirmButton")}
        cancelButtonText={t("PlaylistPage.dialog.cancelButton")}
        type="text"
      />
    </>
  );
};

export default PlaylistEntity;
