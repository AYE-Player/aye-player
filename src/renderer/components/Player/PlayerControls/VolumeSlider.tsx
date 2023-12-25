import { Grid } from '@mui/material';
import Slider from '@mui/material/Slider';
import { withStyles } from '@mui/styles';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { observer } from 'mobx-react-lite';
import React from 'react';
import PlayerInterop from '../../../dataLayer/api/PlayerInterop';
import { useStore } from '../../StoreProvider';

const StyledSlider = withStyles({
  root: {
    color: '#f0ad4e',
  },
})(Slider);

const VolumeSlider: React.FunctionComponent = () => {
  PlayerInterop.init();

  const { player } = useStore();

  const handleVolumeChange = (
    // eslint-disable-next-line @typescript-eslint/ban-types
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
        <VolumeDown onClick={() => handleVolumeChange(null, 0)} />
      </Grid>
      <Grid item xs>
        <StyledSlider
          min={0}
          max={100}
          value={player.volume * 100}
          onChange={handleVolumeChange}
          aria-labelledby="continuous-slider"
        />
      </Grid>
      <Grid item>
        <VolumeUp onClick={() => handleVolumeChange(null, 100)} />
      </Grid>
    </Grid>
  );
};

export default observer(VolumeSlider);
