import { Grid } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import { observer } from "mobx-react-lite";
import React from "react";
import PlayerInterop from "../../../dataLayer/api/PlayerInterop";
import RootStore from "../../../dataLayer/stores/RootStore";
import { debounce } from "../../../helpers";
import useInject from "../../../hooks/useInject";

const StyledSlider = withStyles({
  root: {
    color: "#f0ad4e"
  }
})(Slider);

const VolumeSlider: React.FunctionComponent = () => {
  PlayerInterop.init();

  const Store = ({ app, player, queue, trackHistory }: RootStore) => ({
    app,
    player,
    queue,
    trackHistory
  });

  const { player } = useInject(Store);

  const _handleVolumeChange = (event: any, newValue: number) => {
    debounce(player.setVolume(newValue / 100), 500);
    debounce(PlayerInterop.setVolume(newValue), 500);
    if (newValue === 0) {
      player.mute();
      PlayerInterop.setMute(true);
    } else {
      if (player.isMuted) {
        player.unmute();
        PlayerInterop.setMute(false);
      }
    }
  };

  return (
    <Grid container justify="center" alignItems="center" spacing={1}>
      <Grid item>
        <VolumeDown onClick={() => _handleVolumeChange(null, 0)} />
      </Grid>
      <Grid item xs>
        <StyledSlider
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
  );
};

export default observer(VolumeSlider);
