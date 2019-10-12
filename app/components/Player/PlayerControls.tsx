import React from "react";
import styled from "styled-components";
import Slider from "@material-ui/core/Slider";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import { Grid } from "@material-ui/core";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import StopOutlinedIcon from "@material-ui/icons/StopOutlined";

import { debounce } from "../../helpers/debounce";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";
import { observer } from "mobx-react-lite";

interface IProps {
  play: Function;
  stop: Function;
  pause: Function;
  volume: Function;
  currentVolume: number;
}

const Container = styled.div`
  width: 216px;
  height: 62px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Control = styled.div`
  display: inline-block;
  margin: 0 10px;
`;

const Divider = styled.div`
  height: 10px;
`;

const PlayerControls: React.FunctionComponent<IProps> = props => {
  const PlayerStore = ({ player }: RootStoreModel) => ({
    player: player
  });

  const { player } = useInject(PlayerStore);

  const _handleVolumeChange = (event: any, newValue: number) => {
    debounce(player.setVolume(newValue), 500);
    props.volume(newValue);
  };

  return (
    <Container>
      <Grid container justify="center" spacing={2}>
        <Control onClick={props.play}>
          <PlayCircleOutlineIcon />
        </Control>
        <Control onClick={props.pause}>
          <PauseCircleOutlineIcon />
        </Control>
        <Control onClick={props.stop}>
          <StopOutlinedIcon />
        </Control>
      </Grid>
      <Divider />
      <Grid container>
        <Grid item>
          <VolumeDown onClick={() => _handleVolumeChange(null, 0)} />
        </Grid>
        <Grid item xs>
          <Slider
            value={props.currentVolume}
            onChange={_handleVolumeChange}
            aria-labelledby="continuous-slider"
          />
        </Grid>
        <Grid item>
          <VolumeUp onClick={() => _handleVolumeChange(null, 100)} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default observer(PlayerControls);
