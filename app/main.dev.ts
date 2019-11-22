/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  systemPreferences
} from "electron";
import unhandled from "electron-unhandled";
import "v8-compile-cache";
import config from "./configs/app.config";
import i18n from "./configs/i18next.config";
import Settings from "./dataLayer/stores/PersistentSettings";
import AyeMenu from "./modules/AyeMenu";
import AyeDiscordRPC from "./modules/AyeDiscordRPC";
import AyeMediaKeys from "./modules/AyeMediaKeys";
import AyeMpris from "./modules/AyeMpris";
import AyeTray from "./modules/AyeTray";
import AyeLogger from "./modules/AyeLogger";

export default class Main {
  tray: AyeTray;
  mpris: AyeMpris;
  mediaKeys: AyeMediaKeys;
  rpc: AyeDiscordRPC;
  menu: AyeMenu;
  loadingScreen: BrowserWindow;
  mainWindow: BrowserWindow;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      const sourceMapSupport = require("source-map-support");
      sourceMapSupport.install();
    }

    if (
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true"
    ) {
      require("electron-debug")();
    }
    // Fix the player not being able to play audio when the user did not interact
    // with the page
    app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
    // Set default protocol, to open pages/songs with an external link
    app.setAsDefaultProtocolClient("aye-player");

    // Catch all unhandled errors
    unhandled();

    /**
     * Add event listeners...
     */

    app.on("window-all-closed", async () => {
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("ready", async () => {
      if (
        process.env.NODE_ENV === "development" ||
        process.env.DEBUG_PROD === "true"
      ) {
        await this.installExtensions();
      }

      // Create our screens
      this.createLoadingScreen();
      this.createAppScreen();

      // Remove this if your app does not use auto updates
      // eslint-disable-next-line
      // new AppUpdater();
    });

    // macOS only
    app.on("activate", () => {
      if (this.mainWindow === null) {
        this.createAppScreen();
      } else {
        this.mainWindow.show();
      }
    });

    // Make the app a single-instance app
    const gotTheLock = app.requestSingleInstanceLock();

    app.on("second-instance", (event, args) => {
      // Someone tried to run a second instance, we should focus our window.
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }

      // See if we have a custom scheme notification, and note that Chromium may add its own parameters
      for (const arg of args) {
        const value = arg as string;
        if (value.indexOf("aye-player") !== -1) {
          AyeLogger.info(`FOUND CUSTOM SCHEME ${value}`);
          break;
        }
      }
      AyeLogger.info(`EVENT ${JSON.stringify(event, null, 1)}`);
      AyeLogger.info(`ARGS ${args}`);
    });

    // Quit second instance
    if (!gotTheLock) {
      app.quit();
    }

    // Custom URI for Mac OS
    app.on("open-url", (event, customSchemeData) => {
      event.preventDefault();
      AyeLogger.info(`EVENT ${event}`);
      AyeLogger.info(`CustomSchemeData ${customSchemeData}`);
    });

    // IPC Communication

    ipcMain.on("setDiscordActivity", (event: any, arg: any) => {
      if (!this.rpc && !this.rpc.isConnected) return;
      this.rpc.setActivity(
        arg.playbackPosition,
        arg.endTime,
        arg.state,
        arg.details
      );
    });

    ipcMain.on("disableRPC", async () => {
      await this.rpc.dispose();
    });

    ipcMain.on("enableRPC", async () => {
      await this.rpc.login();
    });

    ipcMain.on("disableTray", () => {
      this.tray.removeTray();
    });

    ipcMain.on("enableTray", () => {
      this.tray.showTray();
    });

    ipcMain.on("restart", () => {
      app.relaunch();
      app.exit();
    });
  }

  installExtensions = async () => {
    const installer = require("electron-devtools-installer");
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ["REACT_DEVELOPER_TOOLS"];

    return Promise.all(
      extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(console.log);
  };

  createLoadingScreen = () => {
    /// create a browser window
    this.loadingScreen = new BrowserWindow({
      /// define width and height for the window
      width: Settings.has("windowSize")
        ? Settings.get("windowSize").width
        : 1333,
      minWidth: 1333,
      height: Settings.has("windowSize")
        ? Settings.get("windowSize").height
        : 728,
      minHeight: 728,
      /// remove the window frame, so it will become a frameless window
      frame: false,
      /// and set the transparency, to remove any window background color
      transparent: true,
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.loadingScreen.loadURL(`file://${__dirname}/loading.html`);

    if (Settings.has("windowPosition")) {
      const { x, y } = Settings.get("windowPosition");
      this.loadingScreen.setPosition(x, y);
    } else {
      this.loadingScreen.center();
    }

    this.loadingScreen.on("closed", () => (this.loadingScreen = null));

    this.loadingScreen.webContents.on("did-finish-load", () => {
      this.loadingScreen.show();
      this.loadingScreen.focus();
    });
  };

  createAppScreen = () => {
    this.mainWindow = new BrowserWindow({
      title: "AYE-Player",
      show: false,
      width: Settings.has("windowSize")
        ? Settings.get("windowSize").width
        : 1333,
      minWidth: 1333,
      height: Settings.has("windowSize")
        ? Settings.get("windowSize").height
        : 728,
      minHeight: 728,
      frame: true,
      titleBarStyle: "hidden",
      maximizable: false,
      webPreferences: {
        nodeIntegration: true
      },
      icon: `${__dirname}/images/icons/png/32x32_w.png`
    });

    this.mainWindow.loadURL(`file://${__dirname}/app.html`);

    if (Settings.has("windowPosition")) {
      const { x, y } = Settings.get("windowPosition");
      this.mainWindow.setPosition(x, y);
    } else {
      this.mainWindow.center();
    }

    if (!this.rpc) {
      // Create DiscordRPC
      this.rpc = new AyeDiscordRPC("621726681140297728");
    }

    if (!this.tray) {
      // Create Tray
      this.tray = new AyeTray(this.mainWindow);
    }

    if (Settings.get("rpcEnabled")) {
      this.rpc.login();
    }

    this.mainWindow.on("ready-to-show", () => {
      if (process.env.START_MINIMIZED) {
        this.mainWindow.minimize();
      } else {
        this.mainWindow.show();
      }

      // Register MPRIS
      if (process.platform === "linux") {
        try {
          new AyeMpris(this.mainWindow).init();
        } catch (err) {
          console.error(err);
        }
      }

      let isTrusted: boolean;
      if (process.platform === "darwin" && !systemPreferences.isTrustedAccessibilityClient(false)) {
        isTrusted = systemPreferences.isTrustedAccessibilityClient(true);
      } else {
        isTrusted = true
      }

      // Register media keys
      if (
        isTrusted === undefined ||
        (process.platform === "darwin" && isTrusted)
      ) {
        this.mediaKeys = new AyeMediaKeys(this.mainWindow);
      }
    });

    this.mainWindow.on("close", event => {
      if (Settings.get("minimizeToTray") && !this.tray.shouldQuit) {
        event.preventDefault();
        this.tray.hideToTray();
        return;
      }

      const [x, y] = this.mainWindow.getPosition();
      const [width, height] = this.mainWindow.getSize();

      // save windows position and size
      Settings.set("windowSize", {
        height,
        width
      });

      Settings.set("windowPosition", {
        x,
        y
      });

      // dispose of rpc client
      this.rpc.dispose();
      // dispose of tray
      this.tray.destroy();
      // unregister shortcuts
      globalShortcut.unregisterAll();
    });

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    this.mainWindow.webContents.on("did-finish-load", () => {
      /// when the content has loaded, hide the loading screen and show the main window
      if (this.loadingScreen) {
        this.loadingScreen.close();
      }

      const lng = Settings.get("language");
      this.mainWindow.webContents.send("language-changed", {
        language: lng,
        namespace: config.namespace,
        resource: i18n.getResourceBundle(lng, config.namespace)
      });

      i18n.changeLanguage(lng);
    });

    this.mainWindow.webContents.on("new-window", (event, url) => {
      event.preventDefault();
    });

    const menuBuilder = new AyeMenu(this.mainWindow, i18n);

    menuBuilder.i18n.on("languageChanged", lng => {
      menuBuilder.build();
      this.mainWindow.webContents.send("language-changed", {
        language: lng,
        namespace: config.namespace,
        resource: menuBuilder.i18n.getResourceBundle(lng, config.namespace)
      });
    });

    ipcMain.on("changeLang", (_event: any, arg: any) => {
      menuBuilder.i18n.changeLanguage(arg.lang);
    });
  };
}

new Main();
