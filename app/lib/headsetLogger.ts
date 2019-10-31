import logFile from "electron-log";
import debug from "debug";
import { unlinkSync } from "fs";

const logger = debug("headset");
const logMedia = debug("headset:media");
const logTray = debug("headset:tray");
const logWin2Player = debug("headset:win2Player");
const logPlayer2Win = debug("headset:player2Win");

logFile.transports.console.level = false;
logFile.transports.file.fileName = "headset.log";
logFile.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] {text}";

class HeadsetLogger {
  // This function will be removed when 'electron-log' gets fixed
  static clear() {
    try {
      unlinkSync(logFile.transports.file.findLogPath());
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Could not clear log", error);
      }
    }
  }

  static info(message) {
    logger(message);
    logFile.info(`headset\t\t ${message}`);
  }

  static media(message) {
    logMedia(message);
    logFile.info(`headset:media\t\t ${message}`);
  }

  static tray(message) {
    logTray(message);
    logFile.info(`headset:tray\t\t ${message}`);
  }

  static win2Player(message) {
    logWin2Player("%O", message);
    if (typeof message[1] === "object" && message[1] !== null) {
      logFile.info(
        `headset:win2Player\t ${message[0]}\n${JSON.stringify(
          message[1],
          null,
          1
        )}`
      );
    } else {
      logFile.info(`headset:win2Player\t ${message}`);
    }
  }

  static player2Win(message) {
    logPlayer2Win("%o", message);
  }
}

export default HeadsetLogger;
