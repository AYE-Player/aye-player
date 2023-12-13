import { InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Channel } from '../../../types/enums';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import Track from '../../dataLayer/models/Track';
import { detectLink } from '../../../helpers';
import SnackMessage from '../Customs/SnackMessage';
import ApiClient from '../../dataLayer/api/ApiClient';
import { useStore } from '../StoreProvider';

const Search = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #565f6c;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const SearchBar: React.FunctionComponent = () => {
  const { t } = useTranslation();
  PlayerInterop.init();

  const { player, queue, searchResult, trackCache, trackHistory } = useStore();
  const { enqueueSnackbar } = useSnackbar();
  const [term, setTerm] = React.useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(event.target.value);
  };

  const search = async (searchTerm: string) => {
    try {
      if (detectLink(searchTerm)) {
        const trackInfo = await searchResult.getTrackFromUrl(searchTerm);
        let track: Track;
        if (trackInfo.duration === 0) {
          track = new Track({ ...trackInfo, isLivestream: true });
        } else {
          track = new Track(trackInfo);
        }

        if (
          !trackCache.tracks.find((cachedTrack) => cachedTrack.id === track.id)
        ) {
          trackCache.add(track);
        }
        searchResult.clear();
        if (player.currentTrack && !player.currentTrack.current.isLivestream) {
          trackHistory.addTrack(player.currentTrack.current);
        }
        queue.addPrivilegedTrack(track);
        player.playTrack(track);
        PlayerInterop.playTrack(track);
      } else {
        const results = await searchResult.getTracks(searchTerm);
        const foundTracks = [];
        for (const result of results) {
          let track: Track;
          if (result.duration === 0) {
            track = new Track({ ...result, isLivestream: true });
          } else {
            track = new Track(result);
          }
          if (
            !trackCache.tracks.find(
              (cachedTrack) => cachedTrack.id === track.id
            )
          ) {
            trackCache.add(track);
          }
          foundTracks.push(track);
        }
        searchResult.clear();
        searchResult.addTracks(foundTracks);
      }
      setTerm('');
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error in SearchBar Component ${error}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage id={key} variant="error" message={t('General.error')} />
        ),
        disableWindowBlurListener: true,
      });
    }
  };

  const handleSearchIconClick = () => {
    if (term.length > 0) {
      search(term);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && term.length > 0) {
      search(term);
    }
  };

  return (
    <Search>
      <InputBase
        onKeyPress={handleKeyPress}
        onChange={handleChange}
        placeholder={t('SearchPage.placeholder')}
        inputProps={{ 'aria-label': t('SearchPage.title') }}
        style={{ color: '#f2f5f4', marginLeft: '16px', width: '100%' }}
      />
      <SearchIcon
        style={{
          padding: '0px 8px',
          backgroundColor: '#3d4653',
          height: '100%',
          borderRadius: '4px',
          width: '38px',
        }}
        onClick={handleSearchIconClick}
      />
    </Search>
  );
};

export default SearchBar;
