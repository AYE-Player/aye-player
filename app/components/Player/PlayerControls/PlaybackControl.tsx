import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import PlayerInterop from "../../../dataLayer/api/PlayerInterop";
import { formattedDuration } from "../../../helpers/";
import { useStore } from "../../StoreProvider";

interface IProps {
  seekingStop: (value: number) => void;
}

const Container = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  bottom: 0px;
  width: 320px;
  background-color: #161618;
`;

const Time = styled.span`
  font-size: 14px;
`;

const PrettoSlider = withStyles({
  root: {
    color: "#f0ad4e",
    height: 8,
    width: 200,
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -2,
    "&:focus,&:hover,&$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
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

const PlaybackControl: React.FunctionComponent<IProps> = (props) => {
  PlayerInterop.init();

  const { player } = useStore();
  let seekTo: number;

  const _handlePlaybackChange = (_event: any, newValue: number) => {
    player.setPlaybackPosition(newValue);
  };

  const _handleSeek = (_event: any, newValue: number) => {
    seekTo = newValue;
  };

  const _handleSeekingStop = () => {
    if (seekTo) {
      props.seekingStop(seekTo);
    }
  };

  return (
    <Container>
      {player.currentTrack || player.livestreamSource ? (
        player.currentTrack?.current.isLivestream || player.livestreamSource ? (
          `🔴 Listening for ${formattedDuration(player.playbackPosition)}`
        ) : (
          <>
            <Time>{formattedDuration(player.playbackPosition)}</Time>
            <PrettoSlider
              min={0}
              max={player.currentTrack?.current.duration || 0}
              value={player.playbackPosition}
              onChange={_handleSeek}
              onChangeCommitted={_handlePlaybackChange}
              onMouseUp={_handleSeekingStop}
            />
            <Time>
              {formattedDuration(player.currentTrack?.current.duration || 0)}
            </Time>
          </>
        )
      ) : null}
    </Container>
  );
};

export default observer(PlaybackControl);
