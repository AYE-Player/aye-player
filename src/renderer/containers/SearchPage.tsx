import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Ref } from 'mobx-keystone';
import { nanoid } from 'nanoid';
import { CircularProgress } from '@mui/material';
import SearchBar from '../components/Search/SearchBar';
import SearchEntity from '../components/Search/SearchEntity';
import PlayerInterop from '../dataLayer/api/PlayerInterop';
import Track from '../dataLayer/models/Track';
import { useStore } from '../components/StoreProvider';

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

const SearchResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ScrollContainer = styled.div<{ $searching: boolean }>`
  overflow: auto;
  height: calc(100% - 150px);
  ${({ $searching }) =>
    $searching
      ? `display: flex;
    justify-content: center;
    align-items: center;`
      : ''}
`;

const SearchPage: React.FunctionComponent = () => {
  const { player, queue, searchResult, trackHistory } = useStore();

  const { t } = useTranslation();

  const handleDoubleClick = (track: Ref<Track>) => {
    if (player.currentTrack) {
      trackHistory.addTrack(player.currentTrack.current);
    }
    queue.addPrivilegedTrack(track.current);
    player.playTrack(track.current);
    PlayerInterop.playTrack(track.current);
  };

  const showLoadingOrResult = () => {
    if (searchResult.searching) {
      return <CircularProgress color="success" size="4rem" />;
    }
    if (!searchResult.searching && searchResult.isEmpty) {
      return [];
    }

    return searchResult.tracks.map((track, index) => {
      return (
        <SearchEntity
          duration={
            track.current.duration === 0
              ? 'LIVE'
              : track.current.formattedDuration
          }
          track={track}
          key={`{${track.current.id}-${nanoid()}`}
          index={index}
          onDoubleClick={handleDoubleClick}
        />
      );
    });
  };

  return (
    <Container>
      <Header>{t('SearchPage.title')}</Header>
      <SearchResultContainer>
        <SearchBar />
        <ScrollContainer $searching={searchResult.searching}>
          {showLoadingOrResult()}
        </ScrollContainer>
      </SearchResultContainer>
    </Container>
  );
};

export default observer(SearchPage);
