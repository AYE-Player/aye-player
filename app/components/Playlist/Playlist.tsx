import React from "react";
import styled from "styled-components";
import PlaylistEntity from "./PlaylistEntity";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import { observer } from "mobx-react-lite";
import Track from "../../dataLayer/models/Track";

interface IProps {}

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
  const [selectedTrackPosition, setSelectedTrackPosition] = React.useState(null);
  const [newPosition, setNewPosition] = React.useState(null);

  const Store = ({ playlist, queue }: RootStoreModel) => ({
    playlist: playlist,
    queue: queue
  });

  const { playlist, queue } = useInject(Store);

  const _onDragStart = (event: any, idx: number) => {
    setSelectedTrackPosition(idx);

    // set indicator style for dragging event
    event.target.style.backgroundColor = "#232c39";
    event.target.style.opacity = 0.3;
    event.target.style.borderBottom = "none";
  }

  const _onDragEnd = (event: any) => {
    // reapply styles after dragging
    event.target.style.backgroundColor = "#232c39";
    event.target.style.opacity = 1;
    event.target.style.borderBottom = "1px solid #565f6c";

    const track = playlist.removeAndGetTrack(selectedTrackPosition);
    playlist.addTrackAt(Track.create({
      id: track.id,
      title: track.title,
      duration: track.duration
    }), newPosition);

    queue.clear();
    queue.addTracks(playlist.getTracksStartingFrom(newPosition));
  }

  return (
    <Container>
      <Header>Playlist</Header>
      <ScrollContainer>
        {playlist.tracks.map((Track, index) => (
          <PlaylistEntity
            duration={Track.formattedDuration}
            track={Track}
            key={Track.id}
            index={index}
            onDragOver={setNewPosition}
            onDragEnd={_onDragEnd}
            onDragStart={_onDragStart}
          />
        ))}
      </ScrollContainer>
    </Container>
  );
};

export default observer(Playlist);
