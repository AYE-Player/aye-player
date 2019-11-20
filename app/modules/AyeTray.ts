import {
  app,
  BrowserWindow,
  Menu,
  nativeTheme,
  Tray
} from "electron";
import path from "path";
import BaseModule from "./BaseModule";
import AyeLogger from "./AyeLogger";
import { LogType } from "../types/enums";

class AyeTray extends BaseModule {
  protected tray: Tray;
  public shouldQuit: boolean;

  constructor(window: BrowserWindow) {
    super(window);

    AyeLogger.tray("Trying to initialize");
    try {
      const imgPath =
        process.env.NODE_ENV === "development"
          ? "../images/icons/png/"
          : "images/icons/png/";
      this.tray = new Tray(
        nativeTheme.shouldUseDarkColors || process.platform === "linux"
          ? path.resolve(path.join(__dirname, `${imgPath}16x16_w.png`))
          : path.resolve(path.join(__dirname, `${imgPath}16x16.png`))
      );
      this.shouldQuit = false;

      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Play/Pause",
          click: () => {
            this.window.webContents.send("play-pause");
          }
        },
        {
          label: "Skip",
          click: () => {
            this.window.webContents.send("play-next");
          }
        },
        {
          label: "Previous",
          click: () => {
            this.window.webContents.send("play-previous");
          }
        },
        { type: "separator" },
        {
          label: "Show AYE",
          click: () => {
            this.window.show();
          }
        },
        {
          label: "Quit AYE",
          click: () => {
            this.shouldQuit = true;
            app.quit();
          }
        }
      ]);
      this.tray.setContextMenu(contextMenu);
      this.tray.setToolTip("AYE - Player");
      this.tray.on("click", () => {
        this.window.show();
        this.window.focus();
      });
    } catch (error) {
      AyeLogger.tray(`Error initializing ${error}`, LogType.ERROR);
    }
  }

  destroy() {
    this.tray.destroy();
  }
}

export default AyeTray;
