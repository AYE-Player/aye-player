import DragHandleIcon from "@material-ui/icons/DragHandle";
import { withStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import styled, { keyframes, css } from "styled-components";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import CustomFormDialog from "../Customs/CustomFormDialog";
import CustomListDialog from "../Customs/CustomListDialog";
import SnackMessage from "../Customs/SnackMessage";
import PlaylistEntityMenu from "./PlaylistEntityMenu";
import { Ref } from "mobx-keystone";

interface IProps {
  duration: string;
  track: Ref<Track>;
  index: number;
  onClick: Function;
}

const marquee = keyframes`
  0% { left: 0; }
  100% { left: -100%; }
}
`;

const animation = () => css`
  ${marquee} 5s linear 2;
`;

const Container = styled.div<any>`
  height: 48px;
  width: calc(100% - 8px);
  display: flex;
  align-items: center;
  padding-left: 8px;
  &:after {
    content: "";
    margin: 0 auto;
    width: calc(100% - 8px);
    padding-top: 46px;
    border-bottom: 1px solid #565f6c;
    margin-left: -278px;
    z-index: 1;
  }
  &:last-child:after {
    border-bottom: none;
    z-index: 1;
  }
  &:hover > svg {
    opacity: 1;
  }
  &:hover > div {
    color: #4fc3f7;
  }
`;

const TrackInfoContainer = styled.div<any>`
  display: inline-block;
  cursor: pointer;
  width: 224px;
  padding: 8px 0;
  padding-left: 8px;
  color: ${(props: any) => (props.active ? "#4fc3f7" : "")};
`;

const Title = styled.div<any>`
  padding-right: 16px;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  z-index: 10;
`;

const ScrollText = styled.div`
  width: 200px;
  z-index: 10;
  &:hover {
    animation-play-state: running;
    animation-fill-mode: none;
    animation: ${animation};
  }
`;

const TextSpan = styled.div`
  float: left;
  display: block;
`;

const Duration = styled.div`
  font-size: 12px;
`;

const DragHandle = withStyles({
  root: {
    opacity: 0,
    cursor: "grab",
    zIndex: 10
  }
})(DragHandleIcon);

const PlaylistEntity: React.FunctionComponent<IProps> = props => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const Store = ({ player, playlists }: RootStore) => ({
    player,
    playlists
  });

  const { player, playlists } = useInject(Store);

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
    } catch (err) {
      console.error(err);
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
        draggableId={props.track.id}
        index={props.index}
      >
        {(provided: any) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DragHandle fontSize="small" />
            <TrackInfoContainer
              active={
                player.currentTrack
                  ? player.currentTrack.id === props.track.id
                  : false
              }
              onClick={() => props.onClick(props.track)}
            >
              <Title length={props.track.current.title.length}>
                <ScrollText>
                  <TextSpan>{props.track.current.title}</TextSpan>
                </ScrollText>
              </Title>
              <Duration>{props.duration}</Duration>
            </TrackInfoContainer>
            <PlaylistEntityMenu
              trackRef={props.track}
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

export default observer(PlaylistEntity);
