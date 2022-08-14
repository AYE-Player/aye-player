import { observer } from 'mobx-react-lite';
import React from 'react';
import Playlist from './Playlist/Playlist';
import Queue from './Queue/Queue';
import PlayerInterop from '../dataLayer/api/PlayerInterop';
import { useStore } from './StoreProvider';

const QueuePlaylistSwitch: React.FunctionComponent = () => {
  const { app, player } = useStore();

  const toggleExternalRadio = () => {
    player.setLivestreamSource('listen.moe');

    if (!player.isPlaying) player.togglePlayingState();

    PlayerInterop.playLivestream('https://listen.moe/stream');
  };

  return app.showQueue ? (
    <Queue toggleExternalRadio={toggleExternalRadio} />
  ) : (
    <Playlist toggleExternalRadio={toggleExternalRadio} />
  );
};

export default observer(QueuePlaylistSwitch);
