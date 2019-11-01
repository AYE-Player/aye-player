import { InputBase } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import SearchEntity from "../components/Search/SearchEntity";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { TrackModel } from "app/dataLayer/models/Track";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  height: 100%;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  height: 100%;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 150px);
`;

const Search = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #565f6c;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const SearchIconContainer = styled.div`
  margin-right: 8px;
`;

// TODO: Dont use playlist as entities, use the search results
const SearchPage: React.FunctionComponent = () => {
  const Store = ({ player, queue }: RootStoreModel) => ({
    player,
    queue
  });

  const { player, queue } = useInject(Store);

  const _handleDoubleClick = (track: TrackModel) => {
    queue.addPrivilegedTrack(track);
    player.playTrack(track);
  }

  return (
    <Container>
      <Header>Search</Header>
      <PlaylistContainer>
        <Search>
          <SearchIconContainer>
            <SearchIcon />
          </SearchIconContainer>
          <InputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>
        <ScrollContainer>
        {player.currentPlaylist.tracks.map((track, index) => {
                return (
                  <SearchEntity
                    duration={track.formattedDuration}
                    track={track}
                    key={track.id}
                    index={index}
                    onDoubleClick={_handleDoubleClick}
                  />
                );
              })}
        </ScrollContainer>
      </PlaylistContainer>
    </Container>
  );
};

export default observer(SearchPage);
