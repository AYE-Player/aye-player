import logFile from "electron-log";
import debug from "debug";
import { unlinkSync } from "fs";

const logger = debug("aye");
const logMedia = debug("aye:media");
const logTray = debug("aye:tray");
const logWin2Player = debug("aye:win2Player");
const logPlayer2Win = debug("aye:player2Win");
const logRPC = debug("aye:rpc");

logFile.transports.console.level = "debug";
logFile.transports.file.fileName = "aye.log";
logFile.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] {text}";

class AyeLogger {
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

  static info(message: string) {
    logger(message);
    logFile.info(`aye\t\t ${message}`);
  }

  static media(message: string) {
    logMedia(message);
    logFile.info(`aye:media\t\t ${message}`);
  }

  static tray(message: string) {
    logTray(message);
    logFile.info(`aye:tray\t\t ${message}`);
  }

  static win2Player(message: string) {
    logWin2Player("%O", message);
    if (typeof message[1] === "object" && message[1] !== null) {
      logFile.info(
        `aye:win2Player\t ${message[0]}\n${JSON.stringify(message[1], null, 1)}`
      );
    } else {
      logFile.info(`aye:win2Player\t ${message}`);
    }
  }

  static rpc(message: string) {
    logRPC(message);
    logFile.info(`aye:rpc\t\t ${message}`);
  }

  static player2Win(message: string) {
    logPlayer2Win("%o", message);
  }
}

export default AyeLogger;
