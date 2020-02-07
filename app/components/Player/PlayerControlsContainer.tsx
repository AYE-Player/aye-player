import React from "react";
import styled from "styled-components";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import Divider from "../Divider";
import PlayerControlElements from "./PlayerControls/PlayerControlElements";
import VolumeSlider from "./PlayerControls/VolumeSlider";
import PlaybackControl from "./PlayerControls/PlaybackControl";

interface IProps {
  play: () => void;
  stop: () => void;
  pause: () => void;
  toggleRepeat: () => void;
  shuffle: () => void;
  skip: () => void;
  previous: () => void;
  seekingStop: (value: number) => void;
  toggleExternalRadio: () => void;
}

const Container = styled.div`
  width: 320px;
  height: 90px;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #161618;
`;

const PlayerControls: React.FunctionComponent<IProps> = props => {
  PlayerInterop.init();

  return (
    <Container>
      <PlayerControlElements
        play={props.play}
        pause={props.pause}
        stop={props.stop}
        shuffle={props.shuffle}
        previous={props.previous}
        skip={props.skip}
        toggleRepeat={props.toggleRepeat}
        toggleExternalRadio={props.toggleExternalRadio}
      />
      <Divider size={2} />
      <VolumeSlider />
      <PlaybackControl seekingStop={props.seekingStop} />
    </Container>
  );
};

export default PlayerControls;
