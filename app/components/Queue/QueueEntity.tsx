import DragHandleIcon from "@material-ui/icons/DragHandle";
import { withStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import CustomFormDialog from "../Customs/CustomFormDialog";
import CustomListDialog from "../Customs/CustomListDialog";
import SnackMessage from "../Customs/SnackMessage";
import QueueEntityMenu from "./QueueEntityMenu";
import { Ref } from "mobx-keystone";

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  onClick: Function;
  dragId: string;
}

const Container = styled.div<any>`
  height: 48px;
  width: calc(100% - 8px);
  display: flex;
  position: relative;
  align-items: center;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover > svg {
    opacity: 1;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: inline-block;
  cursor: pointer;
  width: 224px;
  padding: 8px 0;
  padding-left: 8px;
  color: ${(props: any) => (props.active ? "#f0ad4e" : "")};
`;

const Title = styled.div<any>`
  padding-right: 16px;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  ${(props: any) => {
    if (props.length >= 30) {
      return `div {

        transform: translateX(0);
        transition-timing-function: cubic-bezier(0.42,0,0.58,1);
        transition-duration: 1s;
      }
      :hover div {
        transform: translateX(calc(200px - 100%));
      }`;
    }
  }}
`;

const Duration = styled.div`
  font-size: 12px;
`;

const Dot = styled.span`
  height: 8px;
  width: 8px;
  background-color: #e53935;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`;

const DragHandle = withStyles({
  root: {
    opacity: 0,
    cursor: "grab"
  }
})(DragHandleIcon);

const QueueEntity: React.FunctionComponent<IProps> = props => {
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

  const _handleClose = async (id: string, givenTrack: Track) => {
    setOpen(false);
    const playlist = playlists.getListById(id);
    try {
      if (playlist.tracks.find(track => track.id === givenTrack.id)) {
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
        await playlist.addTrack(givenTrack);
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
      { Url: `https://www.youtube.com/watch?v${props.track.id}` }
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
    <>
      <Draggable
        key={props.dragId}
        draggableId={props.dragId}
        index={props.index}
      >
        {(provided: any) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DragHandle fontSize="small" />
            <TrackInfoContainer onClick={() => props.onClick(props.index)}>
              <Title length={props.track.current.title.length}>
                <div style={{ display: "inline-block" }}>
                  {props.track.current.title}
                </div>
              </Title>
              <Duration>
                {!props.track.current.isLivestream ? (
                  props.duration
                ) : (
                  <div>
                    <Dot />
                    LIVE
                  </div>
                )}
              </Duration>
            </TrackInfoContainer>
            <QueueEntityMenu
              trackRef={props.track}
              isLivestream={props.track.current.isLivestream}
              openListDialog={_handleClickOpen}
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
    </>
  );
};

export default observer(QueueEntity);
