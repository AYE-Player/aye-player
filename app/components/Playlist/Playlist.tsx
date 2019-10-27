import React from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import { observer } from "mobx-react-lite";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import QueueMusicIcon from "@material-ui/icons/QueueMusic";
import Track, { TrackModel } from "../../dataLayer/models/Track";

interface IProps {}

interface IDragResult {
  combine: any;
  destination: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  mode: string;
  reason: string;
  source: {
    index: number;
    droppableId: string;
  };
  type: string;
}

const Container = styled.div`
  margin: 8px 5px;
  width: calc(320px - 5px);
  height: 100%;
  top: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Control = styled.div`
  margin: 0 10px;
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
  const [value, setValue] = React.useState(true); //boolean state

  const Store = ({ app, queue, player }: RootStoreModel) => ({
    app,
    queue,
    player
  });

  const { app, queue, player } = useInject(Store);

  const _handleClick = (track: TrackModel) => {
    const idx = player.currentPlaylist.getIndexOfTrack(track);

    queue.clear();
    queue.addTracks(player.currentPlaylist.getTracksStartingFrom(idx));
    player.playTrack(queue.currentTrack);
    setValue(!value);
  };

  const _showQueue = () => {
    app.toggleQueueDisplay();
  };

  player.currentTrack;

  const _onDragEnd = (result: IDragResult) => {
    const track = player.currentPlaylist.removeAndGetTrack(result.source.index);
    player.currentPlaylist.addTrackAt(
      Track.create({
        id: track.id,
        title: track.title,
        duration: track.duration
      }),
      result.destination.index
    );

    const idx = player.currentPlaylist.getIndexOfTrack(player.currentTrack);

    queue.clear();
    queue.addTracks(player.currentPlaylist.getTracksStartingFrom(idx));
  };

  return (
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
              {player.currentPlaylist.tracks.map((Track, index) => {
                return (
                  <PlaylistEntity
                    duration={Track.formattedDuration}
                    track={Track}
                    key={Track.id}
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
};

export default observer(Playlist);
