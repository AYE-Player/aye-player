import ControlPoint from "@material-ui/icons/ControlPoint";
import { Ref } from "mobx-keystone";
import { Observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided
} from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ApiClient from "../../dataLayer/api/ApiClient";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import { removeControlCharacters } from "../../helpers";
import useInject from "../../hooks/useInject";
import CustomButton from "../Customs/CustomButton";
import CustomTextareaDialog from "../Customs/CustomTextareaDialog";
import SnackMessage from "../Customs/SnackMessage";
import ExtendedPlaylistEntity from "./ExtendedPlaylistEntity";

interface IProps {
  match: any;
}

const Container = styled.div`
  height: 100%;
  top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExtendedPlaylist: React.FunctionComponent<IProps> = props => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [addTracksOpen, setAddTracksOpen] = React.useState(false);
  const [songsToAdd, setSongsToAdd] = React.useState<{ Url: string }[]>([]);
  PlayerInterop.init();

  const Store = ({
    queue,
    player,
    playlists,
    trackCache,
    app,
    trackHistory
  }: RootStore) => ({
    queue,
    player,
    playlists,
    trackCache,
    app,
    trackHistory
  });

  const { queue, player, playlists, trackCache, app, trackHistory } = useInject(
    Store
  );

  const { id } = props.match.params;
  const playlist = playlists.getListById(id);

  if (!playlist) {
    window.location.href = `file://${__dirname}/app.html#/`;
    return null;
  }

  app.setActivePlaylist(id);

  useEffect(() => {
    const controller = new AbortController();

    if (!isLoaded) {
      ApiClient.getTracksFromPlaylist(id, playlist.trackCount).then(songs => {
        songs.map(song => {
          const track = new Track({
            id: song.Id,
            title: song.Title,
            duration: song.Duration
          });
          if (!trackCache.getTrackById(track.id)) {
            trackCache.add(track);
          }
          if (!playlist.getTrackById(track.id)) {
            playlist.addLoadedTrack(track);
          }
        });
        setIsLoaded(true);
      });
    }

    return () => {
      controller.abort();
    };
  }, []);

  const _handleClick = (track: Ref<Track>) => {
    const idx = playlist.getIndexOfTrack(track);

    trackHistory.addTrack(player.currentTrack.current);
    queue.clear();
    queue.addTracks(
      playlist.getTracksStartingFrom(idx).map(track => track.current)
    );
    player.setCurrentPlaylist(playlist);
    player.playTrack(queue.currentTrack.current);
    PlayerInterop.playTrack(queue.currentTrack.current);
  };

  const _onDragEnd = async (
    result: DropResult,
    provided: ResponderProvided
  ) => {
    try {
      await playlist.moveTrackTo(result.source.index, result.destination.index);
    } catch (error) {
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("Error.couldNotAddTrack")}
          />
        )
      });
    }
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
    await playlist.addTracksByUrls(songsToAdd);
  };

  const _handleAddTracksClose = () => {
    setAddTracksOpen(false);
  };

  return (
    <>
      <DragDropContext onDragEnd={_onDragEnd}>
        <Header>{playlist.name}</Header>
        <Container>
          <Droppable droppableId="droppable">
            {(provided: any) => (
              <Observer>
                {() => (
                  <ScrollContainer
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {playlist.tracks.map((track, index) => {
                      return (
                        <ExtendedPlaylistEntity
                          duration={track.current.formattedDuration}
                          track={track}
                          key={track.id}
                          index={index}
                          onClick={_handleClick}
                          active={player.currentTrack?.id === track.id || false}
                        />
                      );
                    })}
                    {provided.placeholder}
                  </ScrollContainer>
                )}
              </Observer>
            )}
          </Droppable>
        </Container>
      </DragDropContext>
      <CustomTextareaDialog
        id="addTracksDialog"
        title={t("PlaylistPage.addTracks.title")}
        label={t("PlaylistPage.addTracks.label")}
        dialogText={t("PlaylistPage.addTracks.text")}
        button={
          <CustomButton
            onClick={() => setAddTracksOpen(true)}
            style={{
              width: "206px",
              height: "40px",
              position: "absolute",
              bottom: "56px",
              right: "16px"
            }}
          >
            {t("PlaylistPage.addTracks.confirmButton")}
            <ControlPoint style={{ marginLeft: "8px" }} />
          </CustomButton>
        }
        open={addTracksOpen}
        handleClose={() => _handleAddTracksClose()}
        handleChange={_onAddTracksChange}
        handleConfirm={_addTracksToPlaylist}
        confirmButtonText={t("PlaylistPage.addTracks.confirmButton")}
        cancelButtonText={t("PlaylistPage.addTracks.cancelButton")}
        type="text"
        placeholder="https://www.youtube.com/watch?v=A3rvyaZFCN4"
      />
    </>
  );
};

export default ExtendedPlaylist;
