import { observer } from "mobx-react-lite";
import React from "react";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Playlist from "./Playlist/Playlist";
import Queue from "./Queue/Queue";
import PlayerInterop from "../dataLayer/api/PlayerInterop";

interface IQueuePlaylistSwitchProps {}

const QueuePlaylistSwitch: React.FunctionComponent<IQueuePlaylistSwitchProps> = props => {
  const Store = ({ app, player }: RootStore) => ({
    app,
    player
  });

  const { app, player } = useInject(Store);

  const _toggleExternalRadio = () => {
    if (!player.isPlaying) player.togglePlayingState();
    PlayerInterop.playLivestream("https://listen.moe/kpop/stream");
  };

  return app.showQueue ? (
    <Queue toggleExternalRadio={() => _toggleExternalRadio()} />
  ) : (
    <Playlist toggleExternalRadio={() => _toggleExternalRadio()} />
  );
};

export default observer(QueuePlaylistSwitch);
