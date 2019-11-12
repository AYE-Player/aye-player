import { observer } from "mobx-react-lite";
import React from "react";
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided
} from "react-beautiful-dnd";
import styled from "styled-components";
import Track, { TrackModel } from "../../dataLayer/models/Track";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
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
  height: calc(100% - 20px);
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExtendedPlaylist: React.FunctionComponent<IProps> = props => {
  const [value, setValue] = React.useState(true); //boolean state

  const Store = ({ queue, player, playlists }: RootStoreModel) => ({
    queue,
    player,
    playlists
  });

  const { queue, player, playlists } = useInject(Store);

  const { id } = props.match.params;
  const playlist = playlists.getListById(id);

  const _handleClick = (track: TrackModel) => {
    const idx = playlist.getIndexOfTrack(track);

    queue.clear();
    queue.addTracks(playlist.getTracksStartingFrom(idx));
    player.setCurrentPlaylist(playlist);
    player.playTrack(queue.currentTrack);
    setValue(!value);
  };

  const _onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const track = playlist.removeAndGetTrack(result.source.index);
    playlist.addTrackAt(
      Track.create({
        id: track.id,
        title: track.title,
        duration: track.duration
      }),
      result.destination.index
    );
  };

  player.currentTrack;

  return (
    <DragDropContext onDragEnd={_onDragEnd}>
      <Container>
        <Header>{playlist.name}</Header>
        <Droppable droppableId="droppable">
          {(provided: any) => (
            <ScrollContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {playlist.tracks.map((Track, index) => {
                return (
                  <ExtendedPlaylistEntity
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

export default observer(ExtendedPlaylist);
