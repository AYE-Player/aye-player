import { Grid } from '@mui/material';
import {
  PauseCircleOutline,
  PlayCircleOutline,
  Repeat as RepeatIcon,
  RepeatOne,
  Shuffle,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components';
import { Repeat } from '../../../../types/enums';
import { useStore } from '../../StoreProvider';

interface IProps {
  play: () => void;
  pause: () => void;
  toggleRepeat: () => void;
  shuffle: () => void;
  skip: () => void;
  previous: () => void;
}

const Control = styled.div`
  display: inline-block;
  margin: 0 8px;
  width: 24px;
  height: 24px;
  opacity: 0.75;
  &:hover {
    cursor: pointer;
    color: #1db954;
    opacity: 1;
  }
`;

const PlayControl = styled.div`
  display: inline-block;
  margin: 0 8px;
  width: 32px;
  height: 32px;
  opacity: 0.75;
  &:hover {
    cursor: pointer;
    color: #1db954;
    opacity: 1;
  }
`;

const PlayerControlElements: React.FunctionComponent<IProps> = (props) => {
  const { app, player, queue, trackHistory } = useStore();
  const { pause, play, previous, shuffle, skip, toggleRepeat } = props;

  const checkTrackIndexBiggerAs = (
    compareValue: number,
    indexAmplifier = 0,
  ) => {
    if (!player.currentTrack) return -1;
    return (
      player.currentPlaylist &&
      player.currentPlaylist.current.getIndexOfTrack(player.currentTrack) +
        indexAmplifier >
        compareValue
    );
  };

  return (
    <Grid container justifyContent="center" alignItems="center" spacing={2}>
      {player.repeat === Repeat.ONE ? (
        <Control onClick={toggleRepeat}>
          <RepeatOne htmlColor="#1db954" />
        </Control>
      ) : (
        <Control onClick={toggleRepeat}>
          {player.repeat === Repeat.PLAYLIST ? (
            <RepeatIcon htmlColor="#1db954" />
          ) : (
            <RepeatIcon />
          )}
        </Control>
      )}
      <Control onClick={previous}>
        <SkipPrevious
          htmlColor={
            trackHistory.tracks.length > 0 || checkTrackIndexBiggerAs(0)
              ? ''
              : '#606060'
          }
        />
      </Control>
      {player.isPlaying ? (
        <PlayControl onClick={pause}>
          <PauseCircleOutline fontSize="large" />
        </PlayControl>
      ) : (
        <PlayControl onClick={play}>
          <PlayCircleOutline fontSize="large" />
        </PlayControl>
      )}
      <Control
        onClick={queue.tracks.length > 1 || app.autoRadio ? skip : () => {}}
      >
        <SkipNext
          htmlColor={
            (queue.tracks.length > 1 && !app.autoRadio) ||
            (player.currentPlaylist &&
              checkTrackIndexBiggerAs(
                player.currentPlaylist.current.tracks.length,
                1,
              ))
              ? ''
              : '#606060'
          }
        />
      </Control>
      <Control onClick={shuffle}>
        {player.isShuffling ? <Shuffle htmlColor="#1db954bf" /> : <Shuffle />}
      </Control>
    </Grid>
  );
};

export default observer(PlayerControlElements);
