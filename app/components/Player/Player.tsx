import React from "react";
import styled from "styled-components";
import YouTube from "react-youtube";
import { observer } from "mobx-react-lite";
import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";

import { debounce } from "../../helpers/debounce";

import PlayerControls from "./PlayerControls";

interface IPlayerProps {}

const Container = styled.div`
  width: 216px;
  height: 261px;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  justify-content: center;
`;

/*const PlayerOverlay = styled.div`
  width: 216px;
  height: 200px;
  background-color: #000;
  position: absolute;
  margin-top: 26px;
  z-index: 999;
`;*/

const opts = {
  height: "200",
  width: "216",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    controls: 0
  }
};

let playerElement: any;

const Player: React.FunctionComponent<IPlayerProps> = () => {
  const PlayerStore = ({ player }: RootStoreModel) => ({
    player: player
  });

  const { player } = useInject(PlayerStore);

  const _onReady = (event: any) => {
    console.log("READY");
    player.setReadyState();
    playerElement = event.target;
    playerElement.setVolume(20);
  };

  const _playVideo = () => {
    playerElement.playVideo();
  };

  const _stopVideo = () => {
    playerElement.stopVideo();
  };

  const _pauseVideo = () => {
    playerElement.pauseVideo();
  };

  const _setVolume = (vol: number) => {
    if (!player.ready) return;
    debounce(playerElement.setVolume(vol), 500);
  };

  return (
    <Container>
      <PlayerControls
        play={() => _playVideo()}
        stop={() => _stopVideo()}
        pause={() => _pauseVideo()}
        volume={_setVolume}
        currentVolume={player.volume}
      />
      {/*<PlayerOverlay/>*/}
      <YouTube
        id="aye-youtube-embed"
        videoId={player.videoId}
        opts={{ height: opts.height, width: opts.width, playerVars: { autoplay: player.autoPlay } }}
        allow="encrypted-media; gyroscope;"
        onReady={_onReady}
      />
    </Container>
  );
};

export default observer(Player);
