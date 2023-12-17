import { observer } from 'mobx-react-lite';
import React from 'react';
import Playlist from './Playlist/Playlist';
import Queue from './Queue/Queue';
import { useStore } from './StoreProvider';

const QueuePlaylistSwitch: React.FunctionComponent = () => {
  const { app } = useStore();

  return app.showQueue ? <Queue /> : <Playlist />;
};

export default observer(QueuePlaylistSwitch);
