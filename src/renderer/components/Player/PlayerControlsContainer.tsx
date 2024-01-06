import React from 'react';
import styled from 'styled-components';
import PlayerInterop from '../../dataLayer/api/PlayerInterop';
import PlayerControlElements from './PlayerControls/PlayerControlElements';
import VolumeSlider from './PlayerControls/VolumeSlider';
import PlaybackControl from './PlayerControls/PlaybackControl';
import Divider from '../Divider';

interface IProps {
  play: () => void;
  pause: () => void;
  toggleRepeat: () => void;
  shuffle: () => void;
  skip: () => void;
  previous: () => void;
  seekingStop: (value: number) => void;
}

const ControlDivider = styled.div`
  position: absolute;
  top: 0px;
  left: -12px;
  border-top: 1px solid #565f6c;
  width: 340px;
`;

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

const PlayerControls: React.FunctionComponent<IProps> = (props) => {
  const { pause, play, previous, seekingStop, shuffle, skip, toggleRepeat } =
    props;
  PlayerInterop.init();

  return (
    <>
      <ControlDivider />
      <Container>
        <Divider size={2} />
        <PlayerControlElements
          play={play}
          pause={pause}
          shuffle={shuffle}
          previous={previous}
          skip={skip}
          toggleRepeat={toggleRepeat}
        />
        <Divider size={1} />
        <VolumeSlider />
        <PlaybackControl seekingStop={seekingStop} />
      </Container>
    </>
  );
};

export default PlayerControls;
