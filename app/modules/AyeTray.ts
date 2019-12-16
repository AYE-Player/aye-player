import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  NativeImage,
  nativeImage
} from "electron";
import path from "path";
import BaseModule from "./BaseModule";
import AyeLogger from "./AyeLogger";
import { LogType } from "../types/enums";

class AyeTray extends BaseModule {
  public shouldQuit: boolean;

  private tray: Tray;
  private icon: string | NativeImage;
  private appName: string;
  private contextMenu: Menu;

  constructor(window: BrowserWindow) {
    super(window);

    AyeLogger.tray("Trying to initialize");
    try {
      this.shouldQuit = false;
      this.appName = "AYE - Player";
      const basePath =
        process.env.NODE_ENV === "development"
          ? "../images/icons/png/"
          : "images/icons/png/";
      if (process.platform === "darwin") {
        const nImage = nativeImage.createFromPath(
          path.resolve(path.join(__dirname, `${basePath}16x16.png`))
        );
        this.icon = nImage;
      } else if (process.platform === "win32") {
        const winPath = process.env.NODE_ENV === "development"
        ? "../images/icons/win/"
        : "images/icons/win/";
        this.icon = path.resolve(path.join(__dirname, `${winPath}icon_w.ico`));
      } else {
        this.icon = path.resolve(
          path.join(__dirname, `${basePath}16x16_w.png`)
        );
      }
      this.tray = new Tray(this.icon);

      this.contextMenu = Menu.buildFromTemplate([
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
      this.tray.setContextMenu(this.contextMenu);
      this.tray.setToolTip(this.appName);
      this.tray.on("click", () => {
        this.toggleWindow();
      });
    } catch (error) {
      AyeLogger.tray(`Error initializing ${error}`, LogType.ERROR);
    }
  }

  removeTray(showWindow = true) {
    if (this.tray != null) {
      this.tray.destroy();
      this.tray = null;
    }

    if (showWindow && this.window != null && !this.window.isVisible()) {
      this.window.show();
    }
  }

  hideToTray() {
    this.showTray();
    if (this.window != null) {
      this.window.hide();
    }
  }

  showTray() {
    if (this.tray != null) {
      return;
    }

    this.tray = new Tray(this.icon);
    this.tray.setToolTip(this.appName);
    this.tray.on("click", () => this.toggleWindow());

    /*if (this.pressedIcon != null) {
      this.tray.setPressedImage(this.pressedIcon);
    }*/
    if (this.contextMenu != null) {
      this.tray.setContextMenu(this.contextMenu);
    }
  }

  private toggleWindow() {
/*     if (this.window == null) {
      if (process.platform === "darwin") {
        // On MacOS, closing the window via the red button destroys the BrowserWindow instance.
        this.window.createWindow().then(() => {
          this.window.show();
        });
      }
      return;
    } */
    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.window.show();
    }
  }

  destroy() {
    this.tray.destroy();
  }
}

export default AyeTray;
