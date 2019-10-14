import React from "react";
import styled from "styled-components";
import Slider from "@material-ui/core/Slider";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import RepeatIcon from "@material-ui/icons/Repeat";
import RepeatOneIcon from "@material-ui/icons/RepeatOne";

import { debounce } from "../../helpers/debounce";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";
import { observer } from "mobx-react-lite";

interface IProps {
  play: Function;
  stop: Function;
  pause: Function;
  toggleRepeat: Function;
  shuffle: Function;
  skip: Function;
  previous: Function;
  seekingStop: Function;
}

const Container = styled.div`
  width: 216px;
  height: 78px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Control = styled.div`
  display: inline-block;
  margin: 0 10px;
`;

const PlaybackControl = styled.div`
  position: absolute;
  display: inline-block;
  margin: 0 10px;
  margin-top: 265px;
  width: 196px;
`;

const Divider = styled.div`
  height: 10px;
`;

const PrettoSlider = withStyles({
  root: {
    color: '#3f51b5',
    height: 8,
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -2,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const PlayerControls: React.FunctionComponent<IProps> = props => {

  const PlayerStore = ({ player }: RootStoreModel) => ({
    player: player
  });

  const { player } = useInject(PlayerStore);

  const _handleVolumeChange = (event: any, newValue: number) => {
    debounce(player.setVolume(newValue / 100), 500);
    if (newValue === 0) {
      player.toggleMute(true);
    } else {
      player.toggleMute(false);
    }
  };

  const _handlePlaybackChange = (event: any, newValue: number) => {
    debounce(player.setPlaybackPosition(newValue), 500);
  }

  const _handleSeekingStop = (event: any) => {
    props.seekingStop(player.getPlaybackPosition);
  }

  return (
    <Container>
      <Grid container justify="center" spacing={2}>
        {player.repeatOneStatus ? (
          <Control onClick={props.toggleRepeat}>
            <RepeatOneIcon color="primary" />
          </Control>
        ) : (
          <Control onClick={props.toggleRepeat}>
            {player.repeatStatus ? (
              <RepeatIcon color="primary" />
            ) : (
              <RepeatIcon />
            )}
          </Control>
        )}
        <Control onClick={props.previous}>
          <SkipPreviousIcon />
        </Control>
        {player.isPlaying ? (
          <Control onClick={props.pause}>
            <PauseCircleOutlineIcon />
          </Control>
        ) : (
          <Control onClick={props.play}>
            <PlayCircleOutlineIcon />
          </Control>
        )}
        <Control onClick={props.skip}>
          <SkipNextIcon />
        </Control>
        <Control onClick={props.shuffle}>
          {player.shuffleStatus ? (
            <ShuffleIcon color="primary" />
          ) : (
            <ShuffleIcon />
          )}
        </Control>
      </Grid>
      <Divider />
      <Grid container spacing={1}>
        <Grid item>
          <VolumeDown onClick={() => _handleVolumeChange(null, 0)} />
        </Grid>
        <Grid item xs>
          <Slider
            min={0}
            max={100}
            value={player.getVolume * 100}
            onChange={_handleVolumeChange}
            aria-labelledby="continuous-slider"
          />
        </Grid>
        <Grid item>
          <VolumeUp onClick={() => _handleVolumeChange(null, 100)} />
        </Grid>
      </Grid>
      <PlaybackControl>
        <PrettoSlider
          min={0}
          max={player.trackDuration}
          value={player.getPlaybackPosition}
          onChange={_handlePlaybackChange}
          onMouseUp={_handleSeekingStop}
        />
      </PlaybackControl>
    </Container>
  );
};

export default observer(PlayerControls);
