import { observer } from "mobx-react-lite";
import { getSnapshot } from "mobx-state-tree";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import SearchBar from "../components/Search/SearchBar";
import SearchEntity from "../components/Search/SearchEntity";
import PlayerInterop from "../dataLayer/api/PlayerInterop";
import { TrackModel } from "../dataLayer/models/Track";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";

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

const SearchPage: React.FunctionComponent = () => {
  const Store = ({
    player,
    queue,
    searchResult,
    trackCache
  }: RootStoreModel) => ({
    player,
    queue,
    searchResult,
    trackCache
  });

  const { player, queue, searchResult } = useInject(Store);

  const { t } = useTranslation();
  PlayerInterop.init();

  const _handleDoubleClick = (track: TrackModel) => {
    queue.addPrivilegedTrack(track);
    player.playTrack(track);
    PlayerInterop.playTrack(getSnapshot(track));
  };

  return (
    <Container>
      <Header>{t("SearchPage.title")}</Header>
      <PlaylistContainer>
        <SearchBar />
        <ScrollContainer>
          {searchResult.isEmpty
            ? []
            : searchResult.tracks.map((track, index) => {
                return (
                  <SearchEntity
                    duration={
                      track.duration === 0 ? "LIVE" : track.formattedDuration
                    }
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
