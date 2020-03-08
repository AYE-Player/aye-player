import { observer } from "mobx-react-lite";
import React from "react";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Playlist from "./Playlist/Playlist";
import Queue from "./Queue/Queue";
import PlayerInterop from "../dataLayer/api/PlayerInterop";

const QueuePlaylistSwitch: React.FunctionComponent = () => {
  const Store = ({ app, player }: RootStore) => ({
    app,
    player
  });

  const { app, player } = useInject(Store);

  const _toggleExternalRadio = () => {
    if (!player.isPlaying) player.togglePlayingState();
    player.setLivestreamSource("listen.moe")
    PlayerInterop.playLivestream("https://listen.moe/kpop/stream");
  };

  return app.showQueue ? (
    <Queue toggleExternalRadio={() => _toggleExternalRadio()} />
  ) : (
    <Playlist toggleExternalRadio={() => _toggleExternalRadio()} />
  );
};

export default observer(QueuePlaylistSwitch);
