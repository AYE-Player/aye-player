import { observer } from "mobx-react-lite";
import React from "react";
import Playlist from "./Playlist/Playlist";
import Queue from "./Queue/Queue";
import PlayerInterop from "../dataLayer/api/PlayerInterop";
import { useStore } from "./StoreProvider";

const QueuePlaylistSwitch: React.FunctionComponent = () => {
  const { app, player } = useStore();

  const _toggleExternalRadio = () => {
    if (!player.isPlaying) player.togglePlayingState();

    player.setLivestreamSource("listen.moe");
    PlayerInterop.playLivestream("https://listen.moe/stream");
  };

  return app.showQueue ? (
    <Queue toggleExternalRadio={() => _toggleExternalRadio()} />
  ) : (
    <Playlist toggleExternalRadio={() => _toggleExternalRadio()} />
  );
};

export default observer(QueuePlaylistSwitch);
