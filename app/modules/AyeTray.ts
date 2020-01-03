import {
  app,
  BrowserWindow,
  Menu,
  NativeImage,
  nativeImage,
  Tray
} from "electron";
import { i18n } from "i18next";
import path from "path";
import { LogType } from "../types/enums";
import AyeLogger from "./AyeLogger";
import BaseModule from "./BaseModule";

class AyeTray extends BaseModule {
  public shouldQuit: boolean;
  public i18n: i18n;

  private tray: Tray;
  private icon: string | NativeImage;
  private appName: string;
  private contextMenu: Menu;

  constructor(window: BrowserWindow, i18n: i18n) {
    super(window);

    AyeLogger.tray("Trying to initialize");
    try {
      this.shouldQuit = false;
      this.i18n = i18n;
      this.appName = "AYE - Player";
      const basePath =
        process.env.NODE_ENV === "development"
          ? "../images/icons/png/"
          : "images/icons/png/";
      if (process.platform === "darwin") {
        const nImage = nativeImage.createFromPath(
          path.resolve(
            path.join(__dirname, `${basePath}${"16x16_Template.png"}`)
          )
        );
        this.icon = nImage;
      } else if (process.platform === "win32") {
        const winPath =
          process.env.NODE_ENV === "development"
            ? "../images/icons/win/"
            : "images/icons/win/";
        this.icon = path.resolve(path.join(__dirname, `${winPath}icon_w.ico`));
      } else {
        this.icon = path.resolve(
          path.join(__dirname, `${basePath}16x16_w.png`)
        );
      }
      this.tray = new Tray(this.icon);

      this.buildContextMenu();
      this.tray.setContextMenu(this.contextMenu);
      this.tray.setToolTip(this.appName);
      this.tray.on("click", () => {
        this.toggleWindow();
      });
    } catch (error) {
      AyeLogger.tray(`Error initializing ${error}`, LogType.ERROR);
    }
  }

  public removeTray(showWindow = true) {
    if (this.tray != null) {
      this.tray.destroy();
      this.tray = null;
    }

    if (showWindow && this.window != null && !this.window.isVisible()) {
      this.window.show();
    }
  }

  public hideToTray() {
    this.showTray();
    if (this.window != null) {
      this.window.hide();
    }
  }

  public showTray() {
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

  public buildContextMenu() {
    this.contextMenu = Menu.buildFromTemplate([
      {
        label: this.i18n.t("Tray.play_pause"),
        click: () => {
          this.window.webContents.send("play-pause");
        }
      },
      {
        label: this.i18n.t("Tray.skip"),
        click: () => {
          this.window.webContents.send("play-next");
        }
      },
      {
        label: this.i18n.t("Tray.previous"),
        click: () => {
          this.window.webContents.send("play-previous");
        }
      },
      { type: "separator" },
      {
        label: this.i18n.t("Tray.show"),
        click: () => {
          this.window.show();
        }
      },
      {
        label: this.i18n.t("Tray.quit"),
        click: () => {
          this.shouldQuit = true;
          app.quit();
        }
      }
    ]);
  }

  public rebuild() {
    this.buildContextMenu();
    this.tray.setContextMenu(this.contextMenu);
  }

  public destroy() {
    this.tray.destroy();
  }
}

export default AyeTray;
