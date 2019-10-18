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
import { observer } from "mobx-react-lite";

import debounce from "../../helpers/debounce";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";
import formattedDuration from "../../../app/helpers/formattedDuration";

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
  width: 320px;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #232c39;
`;

const Control = styled.div`
  display: inline-block;
  margin: 0 10px;
`;

const PlaybackControl = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 265px;
  width: 320px;
  background-color: #232c39;
`;

const Divider = styled.div`
  height: 15px;
  color: #fbfbfb;
`;

const Time = styled.span`
  font-size: 14px;
`;

const PrettoSlider = withStyles({
  root: {
    color: "#3f51b5",
    height: 8,
    width: 200
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -2,
    "&:focus,&:hover,&$active": {
      boxShadow: "inherit"
    }
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)"
  },
  track: {
    height: 8,
    borderRadius: 4
  },
  rail: {
    height: 8,
    borderRadius: 4
  }
})(Slider);

const PlayerControls: React.FunctionComponent<IProps> = props => {
  const Store = ({ player, playlist }: RootStoreModel) => ({
    player,
    playlist
  });

  const { player } = useInject(Store);

  const _handleVolumeChange = (event: any, newValue: number) => {
    debounce(player.setVolume(newValue / 100), 500);
    if (newValue === 0) {
      player.mute();
    } else {
      player.unmute();
    }
  };

  const _handlePlaybackChange = (event: any, newValue: number) => {
    debounce(player.setPlaybackPosition(newValue), 500);
  };

  const _handleSeekingStop = (event: any) => {
    props.seekingStop(player.playbackPosition);
  };

  return (
    <Container>
      <Grid container justify="center" spacing={2}>
        {player.loopTrack ? (
          <Control onClick={props.toggleRepeat}>
            <RepeatOneIcon color="primary" />
          </Control>
        ) : (
          <Control onClick={props.toggleRepeat}>
            {player.loopPlaylist ? (
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
          {player.isShuffling ? (
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
            value={player.volume * 100}
            onChange={_handleVolumeChange}
            aria-labelledby="continuous-slider"
          />
        </Grid>
        <Grid item>
          <VolumeUp onClick={() => _handleVolumeChange(null, 100)} />
        </Grid>
      </Grid>
      <PlaybackControl>
        <Time>{formattedDuration(player.playbackPosition)}</Time>
        <PrettoSlider
          min={0}
          max={player.currentTrack ? player.currentTrack.duration : 0}
          value={player.playbackPosition}
          onChange={_handlePlaybackChange}
          onMouseUp={_handleSeekingStop}
        />
        <Time>{formattedDuration(player.currentTrack ? player.currentTrack.duration : 0)}</Time>
      </PlaybackControl>
    </Container>
  );
};

export default observer(PlayerControls);
