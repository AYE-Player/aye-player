import { Grid } from "@material-ui/core";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import RepeatOneIcon from "@material-ui/icons/RepeatOne";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { Repeat } from "../../../types/enums";
import { useStore } from "../../StoreProvider";

interface IProps {
  play: () => void;
  stop: () => void;
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
`;

const PlayControl = styled.div`
  display: inline-block;
  margin: 0 8px;
  width: 32px;
  height: 32px;
`;

const PlayerControlElements: React.FunctionComponent<IProps> = (props) => {
  const { app, player, queue, trackHistory } = useStore();

  return (
    <Grid container justify="center" alignItems="center" spacing={2}>
      {player.repeat === Repeat.ONE ? (
        <Control onClick={props.toggleRepeat}>
          <RepeatOneIcon htmlColor="#f0ad4e" />
        </Control>
      ) : (
        <Control onClick={props.toggleRepeat}>
          {player.repeat === Repeat.ALL ? (
            <RepeatIcon htmlColor="#f0ad4e" />
          ) : (
            <RepeatIcon />
          )}
        </Control>
      )}
      <Control onClick={trackHistory.tracks.length > 0 ? props.previous : null}>
        <SkipPreviousIcon
          htmlColor={trackHistory.tracks.length <= 0 ? "#606060" : ""}
        />
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
      <Control
        onClick={queue.tracks.length > 1 || app.autoRadio ? props.skip : null}
      >
        <SkipNextIcon
          htmlColor={
            queue.tracks.length <= 1 && !app.autoRadio ? "#606060" : ""
          }
        />
      </Control>
      <Control onClick={props.shuffle}>
        {player.isShuffling ? (
          <ShuffleIcon htmlColor="#f0ad4e" />
        ) : (
          <ShuffleIcon />
        )}
      </Control>
    </Grid>
  );
};

export default observer(PlayerControlElements);
