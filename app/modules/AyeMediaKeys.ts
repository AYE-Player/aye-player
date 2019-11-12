import DBus from "dbus-next";
import { BrowserWindow, globalShortcut, ipcRenderer } from "electron";
import Logger from "./AyeLogger";
import BaseModule from "./BaseModule";

class AyeMediaKeys extends BaseModule {
  bus: DBus.MessageBus;

  constructor(window: BrowserWindow) {
    super(window);

    Logger.media("Trying to register media Keys");
    if (process.platform === "linux") {
      this.bus = DBus.sessionBus();
      this.linux();
    }
    if (process.platform === "win32" || process.platform === "darwin") {
      this.macOSWindows();
    }
  }

  macOSWindows = () => {
    Logger.media("Registering MacOS/Windows keys");
    globalShortcut.register("MediaPlayPause", () => {
      this.window.webContents.send("play-pause");
    });

    globalShortcut.register("MediaNextTrack", () => {
      this.window.webContents.send("play-next");
    });

    globalShortcut.register("MediaPreviousTrack", () => {
      this.window.webContents.send("play-previous");
    });
  };

  linux = () => {
    try {
      this.registerBindings("gnome");
      this.registerBindings("gnome3");
      this.registerBindings("mate");
    } catch (error) {
      console.error(error);
    }
  };

  async registerBindings(desktopEnv: string) {
    let serviceName = `org.${desktopEnv}.SettingsDaemon`;
    let objectPath = `/org/${desktopEnv}/SettingsDaemon/MediaKeys`;
    let interfaceName = `org.${desktopEnv}.SettingsDaemon.MediaKeys`;

    if (desktopEnv === "gnome3") {
      serviceName = "org.gnome.SettingsDaemon.MediaKeys";
      objectPath = "/org/gnome/SettingsDaemon/MediaKeys";
      interfaceName = "org.gnome.SettingsDaemon.MediaKeys";
    }

    try {
      const dbusPlayer = await this.bus.getProxyObject(serviceName, objectPath);
      const mediaKeys = dbusPlayer.getInterface(interfaceName);

      mediaKeys.on("MediaPlayerKeyPressed", (iface, keyName) => {
        Logger.media(`Media key pressed: ${keyName}`);
        switch (keyName) {
          case "Next":
            this.executeMediaKey("play-next");
            break;
          case "Previous":
            this.executeMediaKey("play-previous");
            break;
          case "Play":
            this.executeMediaKey("play-pause");
            break;
          default:
        }
      });

      mediaKeys.GrabMediaPlayerKeys("ayeplayer", 0);
      Logger.media(`Grabbed media keys for ${desktopEnv}`);
    } catch (err) {
      // Error if trying to grab keys in another desktop environment
    }
  }

  executeMediaKey(key: string) {
    Logger.media(`Executing ${key} media key command`);
    ipcRenderer.send(key);
  }
}

export default AyeMediaKeys;
