import QueueMusicIcon from "@material-ui/icons/QueueMusic";
import Radio from "@material-ui/icons/Radio";
import { Ref } from "mobx-keystone";
import { Observer, observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided
} from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import SnackMessage from "../Customs/SnackMessage";
import PlaylistEntity from "./PlaylistEntity";

interface IProps {
  toggleExternalRadio: () => void;
}

const Container = styled.div`
  margin: 8px 5px;
  width: 315px;
  height: 100%;
  top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Control = styled.div`
  margin: 0 16px;
  width: 24px;
  height: 24px;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 376px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ButtonAligner = styled.div`
  display: flex;
  align-items: center;
`;

const Playlist: React.FunctionComponent<IProps> = props => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  PlayerInterop.init();

  const Store = ({ app, queue, player, trackHistory }: RootStore) => ({
    app,
    queue,
    player,
    trackHistory
  });

  const { app, queue, player, trackHistory } = useInject(Store);

  const _handleClick = (track: Ref<Track>) => {
    const idx = player.currentPlaylist.current.getIndexOfTrack(track);

    trackHistory.addTrack(player.currentTrack.current);
    queue.clear();
    queue.addTracks(
      player.currentPlaylist.current
        .getTracksStartingFrom(idx)
        .map(track => track.current)
    );
    player.playTrack(queue.currentTrack.current);
    PlayerInterop.playTrack(queue.currentTrack.current);
  };

  const _showQueue = () => {
    app.toggleQueueDisplay();
  };

  const _onDragEnd = async (
    result: DropResult,
    provided: ResponderProvided
  ) => {
    try {
      await player.currentPlaylist.current.moveTrackTo(
        result.source.index,
        result.destination.index
      );

      const idx = player.currentPlaylist.current.getIndexOfTrack(
        player.currentTrack
      );

      if (result.destination.index > idx) {
        queue.clear();
        queue.addTracks(
          player.currentPlaylist.current
            .getTracksStartingFrom(idx)
            .map(track => track.current)
        );
      }
    } catch (error) {
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage
            id={key}
            variant="error"
            message={t("Error.couldNotMoveTrack")}
          />
        )
      });
    }
  };

  const renderPlaylist = () => (
    <DragDropContext onDragEnd={_onDragEnd}>
      <Container>
        <Header>
          Playlist
          <ButtonAligner>
            <Control onClick={props.toggleExternalRadio}>
              <Radio />
            </Control>
            <Control>
              <QueueMusicIcon onClick={() => _showQueue()} />
            </Control>
          </ButtonAligner>
        </Header>
        <Droppable droppableId="droppable">
          {provided => (
            <Observer>
              {() => (
                <ScrollContainer
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {player.currentPlaylist.current.tracks.map((track, index) => {
                    return (
                      <PlaylistEntity
                        duration={track.current.formattedDuration}
                        track={track}
                        key={track.current.id}
                        index={index}
                        onClick={_handleClick}
                        active={
                          player.currentTrack?.current.id === track.current.id
                        }
                        isReadonly={player.currentPlaylist.current.isReadonly}
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
  );

  return player.currentPlaylist ? (
    renderPlaylist()
  ) : (
    <Container>
      <Header>
        Playlist
        <Control>
          <QueueMusicIcon onClick={() => _showQueue()} />
        </Control>
      </Header>
      {t("Playlist.noList")}
    </Container>
  );
};

export default observer(Playlist);
