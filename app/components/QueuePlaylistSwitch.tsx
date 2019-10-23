import React from "react";
import { observer } from "mobx-react-lite";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Queue from "./Queue/Queue";
import Playlist from "./Playlist/Playlist";

interface IQueuePlaylistSwitchProps {}

const QueuePlaylistSwitch: React.FunctionComponent<IQueuePlaylistSwitchProps> = props => {
  const Store = ({ app }: RootStoreModel) => ({
    app
  });

  const { app } = useInject(Store);

  return (
    app.showQueue ? <Queue/> : <Playlist />
  );
};

export default observer(QueuePlaylistSwitch);
