import { ipcMain, BrowserWindow, App } from "electron";
import mpris from "mpris-service";
import logger from "./ayeLogger";

function executeMediaKey(win: BrowserWindow, key: string) {
  logger.info(`Sending key: ${key}`);
  win.webContents.send(key);
}

function changeVolumeState(win: BrowserWindow, volume) {
  win.webContents.executeJavaScript(`
    window.changeVolumeSate(${volume})
  `);
}

const mprisService = (win: BrowserWindow, app: App) => {
  logger.media("Initializing MPRIS");
  const mprisPlayer = mpris({
    name: "ayeplayer",
    identity: "AYE Player",
    canRaise: true,
    supportedInterfaces: ["player"],
    desktopEntry: "ayeplayer"
  });

  mprisPlayer.playbackStatus = "Stopped";
  mprisPlayer.rate = 1;
  mprisPlayer.canSeek = true;
  mprisPlayer.canControl = true;
  mprisPlayer.minimumRate = 1;
  mprisPlayer.maximumRate = 1;
  mprisPlayer.volume = 0.2;

  mprisPlayer.on("raise", () => {
    logger.media("Window raised");
    win.show();
  });

  mprisPlayer.on("quit", () => {
    logger.media("Quitting Aye");
    app.exit();
  });

  mprisPlayer.on("rate", () => {
    logger.media("Attempting to change rate");
    mprisPlayer.rate = 1;
  });

  mprisPlayer.on("playpause", () => {
    logger.media("Play-Pause received");
    if (
      mprisPlayer.playbackStatus === "Playing" ||
      mprisPlayer.playbackStatus === "Paused"
    ) {
      executeMediaKey(win, "play-pause");
    }
  });

  mprisPlayer.on("play", () => {
    logger.media("Play received");
    if (
      mprisPlayer.playbackStatus === "Paused" ||
      mprisPlayer.playbackStatus === "Stopped"
    ) {
      executeMediaKey(win, "play-pause");
    }
  });

  mprisPlayer.on("pause", () => {
    logger.media("Pause received");
    if (mprisPlayer.playbackStatus === "Playing") {
      executeMediaKey(win, "play-pause");
    }
  });

  mprisPlayer.on("next", () => {
    logger.media("Next received");
    if (
      mprisPlayer.playbackStatus === "Playing" ||
      mprisPlayer.playbackStatus === "Paused"
    ) {
      executeMediaKey(win, "play-next");
    }
  });

  mprisPlayer.on("previous", () => {
    logger.media("Previous received");
    if (
      mprisPlayer.playbackStatus === "Playing" ||
      mprisPlayer.playbackStatus === "Paused"
    ) {
      executeMediaKey(win, "play-previous");
    }
  });

  mprisPlayer.on("volume", (vol: number) => {
    if (mprisPlayer.playbackStatus !== "Stopped") {
      let volume = vol;
      if (vol > 1) {
        volume = 1;
      }
      if (vol < 0) {
        volume = 0;
      }

      logger.media(`Volume received, set to: ${volume}`);
      changeVolumeState(win, volume * 100);
      win.webContents.send("win2Player", ["setVolume", volume * 100]);
      mprisPlayer.volume = volume;
    }
  });

  mprisPlayer.on("seek", (seek: number) => {
    if (mprisPlayer.playbackStatus !== "Stopped") {
      logger.media(`Seek ${seek / 1e6} sec`);
      win.webContents.send("player2Win", [
        "seekTo",
        (mprisPlayer.getPosition() + seek) / 1e6
      ]); // in seconds
    }
  });

  mprisPlayer.on("position", (arg: any) => {
    if (mprisPlayer.playbackStatus !== "Stopped") {
      logger.media(`Go to position ${arg.position / 1e6} sec`);
      win.webContents.send("player2Win", ["seekTo", arg.position / 1e6]); // in seconds
    }
  });

  mprisPlayer.on("shuffle", shuffle => {
    if (mprisPlayer.playbackStatus !== "Stopped") {
      logger.media(`Set shuffling: ${shuffle}`);
      win.webContents.send("player2Win", ["onMprisShuffle", shuffle]);
      mprisPlayer.shuffle = shuffle;
    }
  });

  mprisPlayer.on("loopStatus", loop => {
    if (mprisPlayer.playbackStatus !== "Stopped") {
      logger.media(`Set looping to: ${loop}`);
      mprisPlayer.loopStatus = loop;
      let repeat = null;
      if (loop === "Track") repeat = "one";
      if (loop === "Playlist") repeat = "all";
      if (loop === "None") repeat = null;
      win.webContents.send("player2Win", ["onMprisRepeat", repeat]);
    }
  });

  ipcMain.on("win2Player", (e, args) => {
    switch (args[0]) {
      case "setVolume":
        mprisPlayer.volume = args[1] / 100;
        break;
      case "trackInfo":
        mprisPlayer.metadata = {
          "xesam:artist": [args[1].artist],
          "xesam:title": args[1].title,
          "xesam:url": `https://www.youtube.com/watch?v=${args[1].id}`,
          "mpris:trackid": mprisPlayer.objectPath("track/0"),
          "mpris:artUrl": args[1].thumbnail,
          "mpris:length": args[1].duration * 1e6 // in microseconds
        };
        logger.media(
          `Track Info:\n${JSON.stringify(mprisPlayer.metadata, null, 2)}`
        );
        break;
      case "seekTo":
        mprisPlayer.seeked(args[1] * 1e6); // in microseconds
        break;
      case "shuffle":
        mprisPlayer.shuffle = args[1];
        break;
      case "repeat":
        if (args[1] === "one") mprisPlayer.loopStatus = "Track";
        if (args[1] === "all") mprisPlayer.loopStatus = "Playlist";
        if (args[1] === null) mprisPlayer.loopStatus = "None";
        break;
      default:
    }
  });

  ipcMain.on("player2Win", (e, args) => {
    console.log("PLAYER 2 WIN", args);
    switch (args[0]) {
      case "currentTime":
        mprisPlayer.getPosition = () => args[1] * 1e6; // in microseconds
        break;
      case "onStateChange":
        if (args[1] === true) mprisPlayer.playbackStatus = "Playing";
        if (args[1] === false) mprisPlayer.playbackStatus = "Paused";
        logger.media(`Playback status: ${mprisPlayer.playbackStatus}`);
        break;
      default:
    }
  });
};

export default mprisService;
