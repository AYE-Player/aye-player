import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import SearchBar from "../components/Search/SearchBar";
import SearchEntity from "../components/Search/SearchEntity";
import PlayerInterop from "../dataLayer/api/PlayerInterop";
import Track from "../dataLayer/models/Track";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { Ref } from "mobx-keystone";

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
  const Store = ({ player, queue, searchResult, trackCache }: RootStore) => ({
    player,
    queue,
    searchResult,
    trackCache
  });

  const { player, queue, searchResult } = useInject(Store);

  const { t } = useTranslation();

  const _handleDoubleClick = (track: Ref<Track>) => {
    queue.addPrivilegedTrack(track.current);
    player.playTrack(track.current);
    PlayerInterop.playTrack(track.current);
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
                      track.current.duration === 0
                        ? "LIVE"
                        : track.current.formattedDuration
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
