import { Grid } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import RepeatOneIcon from "@material-ui/icons/RepeatOne";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import formattedDuration from "../../../app/helpers/formattedDuration";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import { debounce } from "../../helpers/";
import useInject from "../../hooks/useInject";
import { Repeat } from "../../types/enums";
import Divider from "../Divider";

interface IProps {
  play: () => void;
  stop: () => void;
  pause: () => void;
  toggleRepeat: () => void;
  shuffle: () => void;
  skip: () => void;
  previous: () => void;
  seekingStop: (value: number) => void;
}

const Container = styled.div`
  width: 320px;
  height: 90px;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #232c39;
`;

const Control = styled.div`
  display: inline-block;
  margin: 0 10px;
  width: 24px;
  height: 24px;
`;

const PlayControl = styled.div`
  display: inline-block;
  margin: 0 10px;
  width: 32px;
  height: 32px;
`;

const PlaybackControl = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 266px;
  width: 320px;
  background-color: #232c39;
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
  const Store = ({ player }: RootStoreModel) => ({
    player
  });

  const { player } = useInject(Store);

  const _handleVolumeChange = (event: any, newValue: number) => {
    const playerElement = document.querySelector("#embedded-player") as any;
    debounce(player.setVolume(newValue / 100), 500);
    debounce(playerElement.contentWindow.postMessage(
      {
        type: "volume",
        volume: newValue / 100
      },
      "https://player.aye-player.de"
    ), 500);
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
      <Grid container justify="center" alignItems="center" spacing={2}>
        {player.repeat === Repeat.ONE ? (
          <Control onClick={props.toggleRepeat}>
            <RepeatOneIcon color="primary" />
          </Control>
        ) : (
          <Control onClick={props.toggleRepeat}>
            {player.repeat === Repeat.ALL ? (
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
          <PlayControl onClick={props.pause}>
            <PauseCircleOutlineIcon fontSize="large" />
          </PlayControl>
        ) : (
          <PlayControl onClick={props.play}>
            <PlayCircleOutlineIcon fontSize="large" />
          </PlayControl>
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
      <Divider size={2} />
      <Grid container justify="center" alignItems="center" spacing={1}>
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
        {player.currentTrack ? (
          player.currentTrack.isLivestream ? (
            `🔴 Listening for ${formattedDuration(player.playbackPosition)}`
          ) : (
            <>
              <Time>{formattedDuration(player.playbackPosition)}</Time>
              <PrettoSlider
                min={0}
                max={player.currentTrack?.duration || 0}
                value={player.playbackPosition}
                onChangeCommitted={_handlePlaybackChange}
                onMouseUp={_handleSeekingStop}
              />
              <Time>
                {formattedDuration(player.currentTrack?.duration || 0)}
              </Time>
            </>
          )
        ) : (
          null
        )}
      </PlaybackControl>
    </Container>
  );
};

export default observer(PlayerControls);
