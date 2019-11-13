import debug from "debug";
import logFile from "electron-log";
import { unlinkSync } from "fs";

const logger = debug("aye");
const logMedia = debug("aye:media");
const logTray = debug("aye:tray");
const logWin2Player = debug("aye:win2Player");
const logPlayer2Win = debug("aye:player2Win");
const logRPC = debug("aye:rpc");
const logPlayer = debug("aye:player");

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
    this.log(message, "info");
  }

  static media(message: string, type?: string) {
    logMedia(message);
    this.log(message, "media", type);
  }

  static tray(message: string, type?: string) {
    logTray(message);
    this.log(message, "tray", type);
  }

  static win2Player(message: string, type?: string) {
    logWin2Player("%O", message);
    if (typeof message[1] === "object" && message[1] !== null) {
      message = `\t ${message[0]}\n${JSON.stringify(message[1], null, 1)}`;
    }
    this.log(message, "win2Player", type);
  }

  static rpc(message: string, type?: string) {
    logRPC(message);
    this.log(message, "rpc", type);
  }

  static player2Win(message: string, type?: string) {
    logPlayer2Win("%o", message);
    this.log(message, "player2Win", type);
  }

  static player(message: string, type?: string) {
    logPlayer(message);
    this.log(message, "player", type);
  }

  static log(message: string, service: string, type: string = "info") {
    switch (type) {
      case "warn":
        logFile.warn(`[WARN] aye:${service}\t\t ${message}`);
        break;
      case "error":
        logFile.error(`[ERROR] aye:${service}\t\t ${message}`);
        break;
      default:
        logFile.info(`aye:${service}\t\t ${message}`);
        break;
    }
  }
}

export default AyeLogger;
