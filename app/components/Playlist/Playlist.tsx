import QueueMusicIcon from "@material-ui/icons/QueueMusic";
import { observer } from "mobx-react-lite";
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
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import SnackMessage from "../Customs/SnackMessage";
import PlaylistEntity from "./PlaylistEntity";
import { Ref } from "mobx-keystone";

interface IProps {}

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
  height: calc(100% - 364px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Playlist: React.FunctionComponent<IProps> = props => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  PlayerInterop.init();

  const [value, setValue] = React.useState(true); //boolean state

  const Store = ({ app, queue, player }: RootStore) => ({
    app,
    queue,
    player
  });

  const { app, queue, player } = useInject(Store);

  const _handleClick = (track: Ref<Track>) => {
    const idx = player.currentPlaylist.current.getIndexOfTrack(track);

    queue.clear();
    queue.addTracks(
      player.currentPlaylist.current
        .getTracksStartingFrom(idx)
    );
    player.playTrack(queue.currentTrack);
    PlayerInterop.playTrack(queue.currentTrack);
    setValue(!value);
  };

  const _showQueue = () => {
    app.toggleQueueDisplay();
  };

  player.currentTrack;

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

      queue.clear();
      queue.addTracks(
        player.currentPlaylist.current.getTracksStartingFrom(idx)
      );
      setValue(!value);
    } catch (error) {
      AyeLogger.player(
        `Error in Playlist Component ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        )
      });
    }
  };

  const renderPlaylist = () => (
    <DragDropContext onDragEnd={_onDragEnd}>
      <Container>
        <Header>
          Playlist
          <Control>
            <QueueMusicIcon onClick={() => _showQueue()} />
          </Control>
        </Header>
        <Droppable droppableId="droppable">
          {(provided: any) => (
            <ScrollContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {player.currentPlaylist.current.tracks.map((track, index) => {
                return (
                  <PlaylistEntity
                    duration={track.current.formattedDuration}
                    track={track}
                    key={track.id}
                    index={index}
                    onClick={_handleClick}
                  />
                );
              })}
              {provided.placeholder}
            </ScrollContainer>
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
