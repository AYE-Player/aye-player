import React from "react";
import { RootStoreModel } from "../../../app/store/RootStore";
import useInject from "../../../app/hooks/useInject";
import { TextField } from "@material-ui/core";
import Track from "../../../app/store/Track";

const DebugAddTrack: React.FunctionComponent = () => {
  const Store = ({ player, playlist }: RootStoreModel) => ({
    player: player,
    playlist: playlist
  });

  const { player, playlist } = useInject(Store);
  let videoId;

  const _handleChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    videoId = event.target.value;
  };

  const _addTrack = () => {
    playlist.addPrivilegedTrack(
      Track.create({
        id: videoId,
        title: "DEMO TRACK",
        duration: 231
      })
    );
    setTimeout(() => player.playTrack(playlist.getTrackById(videoId)), 1000);
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
