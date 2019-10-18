import React from "react";
import { RootStoreModel } from "../../stores/RootStore";
import useInject from "../../../app/hooks/useInject";
import { TextField } from "@material-ui/core";
import Track from "../../stores/Track";

const DebugAddTrack: React.FunctionComponent = () => {
  const Store = ({ player, queue }: RootStoreModel) => ({
    player: player,
    queue: queue
  });

  const { player, queue } = useInject(Store);
  let videoId;

  const _handleChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    videoId = event.target.value;
  };

  const _addTrack = () => {
    const track = Track.create({
      id: videoId,
      title: "DEMO TRACK",
      duration: 231
    });
    queue.addPrivilegedTrack(track);
    setTimeout(() => player.playTrack(track), 1000);
  };

  return (
    <>
      <TextField
        id="standard-name"
        label="Name"
        value={videoId}
        onChange={_handleChange()}
        style={{ backgroundColor: "#fcfcfb" }}
        margin="normal"
      />
      <div>
        <div style={{ width: "100px", height: "50px" }} onClick={_addTrack}>
          ADD TRACK
        </div>
      </div>
    </>
  );
};

export default DebugAddTrack;
