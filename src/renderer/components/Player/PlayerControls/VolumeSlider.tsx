import { Grid, Tooltip } from '@mui/material';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components';
import PlayerInterop from '../../../dataLayer/api/PlayerInterop';
import { useStore } from '../../StoreProvider';

const IconWrapper = styled.span`
  &:hover {
    cursor: pointer;
    color: #f0ad4e;
  }
`;

const VolumeSlider: React.FunctionComponent = () => {
  PlayerInterop.init();

  const { player } = useStore();

  const handleVolumeChange = (
    _event: Event | null,
    newValue: number | number[],
  ) => {
    if (Array.isArray(newValue)) {
      const [value] = newValue;
      // eslint-disable-next-line no-param-reassign
      newValue = value;
    }
    player.setVolume(newValue / 100);
    PlayerInterop.setVolume(newValue);
    if (newValue === 0) {
      player.mute();
      PlayerInterop.setMute(true);
    } else if (player.isMuted) {
      player.unmute();
      PlayerInterop.setMute(false);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" spacing={1}>
      <Grid item>
        <IconWrapper>
          <Tooltip title="Mute">
            <VolumeDown onClick={() => handleVolumeChange(null, 0)} />
          </Tooltip>
        </IconWrapper>
      </Grid>
      <Grid item xs>
        <Slider
          min={0}
          max={100}
          value={player.volume * 100}
          onChange={handleVolumeChange}
          size="small"
          aria-labelledby="continuous-slider"
        />
      </Grid>
      <Grid item>
        <IconWrapper>
          <VolumeUp onClick={() => handleVolumeChange(null, 100)} />
        </IconWrapper>
      </Grid>
    </Grid>
  );
};

export default observer(VolumeSlider);
