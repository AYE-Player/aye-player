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
  const [selectedTrackIdx, setSelectedTrackIdx] = React.useState(null);
  const [newIdx, setNewIdx] = React.useState(null);

  const Store = ({ playlist, queue }: RootStoreModel) => ({
    playlist: playlist,
    queue: queue
  });

  const { playlist, queue } = useInject(Store);

  const _onDragEnd = () => {
    const track = playlist.removeAndGetTrack(selectedTrackIdx);
    playlist.addTrackAt(Track.create({
      id: track.id,
      title: track.title,
      duration: track.duration
    }), newIdx);

    queue.clear();
    queue.addTracks(playlist.getTracksStartingFrom(newIdx));
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
            onDragOver={setNewIdx}
            onDragEnd={_onDragEnd}
            setSelectedTrack={setSelectedTrackIdx}
          />
        ))}
      </ScrollContainer>
    </Container>
  );
};

export default observer(Playlist);
