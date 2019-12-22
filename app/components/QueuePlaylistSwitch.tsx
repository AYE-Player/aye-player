import { observer } from "mobx-react-lite";
import React from "react";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Playlist from "./Playlist/Playlist";
import Queue from "./Queue/Queue";

interface IQueuePlaylistSwitchProps {}

const QueuePlaylistSwitch: React.FunctionComponent<IQueuePlaylistSwitchProps> = props => {
  const Store = ({ app }: RootStore) => ({
    app
  });

  const { app } = useInject(Store);

  return app.showQueue ? <Queue /> : <Playlist />;
};

export default observer(QueuePlaylistSwitch);
