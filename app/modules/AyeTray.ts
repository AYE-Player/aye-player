import { Tray, BrowserWindow, nativeTheme, Menu, app } from "electron";
import BaseModule from "./BaseModule";

class AyeTray extends BaseModule {
  protected tray: Tray;
  public shouldQuit: boolean;

  constructor(window: BrowserWindow) {
    super(window);
  }

  init() {
    this.tray = new Tray(
      nativeTheme.shouldUseDarkColors
        ? `${__dirname}/../images/icons/png/16x16_w.png`
        : `${__dirname}/../images/icons/png/16x16.png`
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
