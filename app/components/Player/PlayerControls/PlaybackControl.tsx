import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import PlayerInterop from "../../../dataLayer/api/PlayerInterop";
import RootStore from "../../../dataLayer/stores/RootStore";
import { debounce, formattedDuration } from "../../../helpers/";
import useInject from "../../../hooks/useInject";

interface IProps {
  seekingStop: (value: number) => void;
}

const Container = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 266px;
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


const PlaybackControl: React.FunctionComponent<IProps> = props => {
  PlayerInterop.init();

  const Store = ({ app, player, queue, trackHistory }: RootStore) => ({
    app,
    player,
    queue,
    trackHistory
  });

  const { player } = useInject(Store);
  let seekTo: number;


  const _handlePlaybackChange = (event: any, newValue: number) => {
    debounce(player.setPlaybackPosition(newValue), 500);
  };

  const _handleSeek = (event: any, newValue: number) => {
    seekTo = newValue;
  };

  const _handleSeekingStop = () => {
    if (seekTo) {
      props.seekingStop(seekTo);
    }
  };

  return (
      <Container>
        {player.currentTrack ? (
          player.currentTrack.current.isLivestream ? (
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
