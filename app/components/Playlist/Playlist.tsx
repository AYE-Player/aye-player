import React from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import { observer } from "mobx-react-lite";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
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

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 364px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const Playlist: React.FunctionComponent<IProps> = props => {
  const [value, setValue] = React.useState(true); //boolean state

  const Store = ({ playlists, queue, player }: RootStoreModel) => ({
    playlists: playlists,
    queue: queue,
    player: player
  });

  const { playlists, queue, player } = useInject(Store);
  const playlist = playlists.getListById(player.currentPlaylistId);

  const _handleClick = (track: TrackModel) => {
    const idx = playlist.getIndexOfTrack(track);

    queue.clear();
    queue.addTracks(playlist.getTracksStartingFrom(idx));
    player.playTrack(queue.currentTrack);
    setValue(!value);
  };

  // TODO: rethink drag an drop queue logic, its not working right now // also think about shuffle playback, this will
  // break it right now
  const _onDragEnd = (result: IDragResult) => {
    const track = playlist.removeAndGetTrack(result.source.index);
    playlist.addTrackAt(
      Track.create({
        id: track.id,
        title: track.title,
        duration: track.duration
      }),
      result.destination.index
    );

    const idx = playlist.getIndexOfTrack(player.currentTrack);

    queue.clear();
    queue.addTracks(playlist.getTracksStartingFrom(idx));
  };

  return (
    <DragDropContext onDragEnd={_onDragEnd}>
      <Container>
        <Header>Playlist</Header>
        <Droppable droppableId="droppable">
          {(provided: any) => (
            <ScrollContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {playlist.tracks.map((Track, index) => {
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
