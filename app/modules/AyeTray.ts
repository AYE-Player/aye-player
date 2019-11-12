import { app, BrowserWindow, Menu, nativeTheme, Tray } from "electron";
import path from "path";
import BaseModule from "./BaseModule";

class AyeTray extends BaseModule {
  protected tray: Tray;
  public shouldQuit: boolean;

  constructor(window: BrowserWindow) {
    super(window);

    this.tray = new Tray(
      nativeTheme.shouldUseDarkColors || process.platform === "linux"
        ? path.resolve(
            path.join(
              __dirname,
              process.env.NODE_ENV === "development"
                ? "../images/icons/png/16x16_w.png"
                : "images/icons/png/16x16_w.png"
            )
          )
        : path.resolve(
            path.join(
              __dirname,
              process.env.NODE_ENV === "development"
                ? "../images/icons/png/16x16_w.png"
                : "images/icons/png/16x16.png"
            )
          )
    );

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: function() {
          this.window.show();
        }
      },
      {
        label: "Quit",
        click: function() {
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
  }
}

export default AyeTray;
