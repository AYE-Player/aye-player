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
import log from "electron-log";
import unhandled from "electron-unhandled";
import { autoUpdater } from "electron-updater";
import "v8-compile-cache";
import i18n from "./configs/i18next.config";
import Settings from "./dataLayer/stores/PersistentSettings";
import registerMediaKeys from "./lib/registerMediaKeys";
import RPCClient from "./lib/RPCClient";
import MenuBuilder from "./menu";
import config from "./configs/app.config";
import AyeTray from "./modules/AyeTray";
import AyeMpris from "./modules/AyeMpris";

export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

let mainWindow: BrowserWindow = null;
let loadingScreen: BrowserWindow = null;
let tray: AyeTray = null;
let rpc = new RPCClient("621726681140297728");

// Fix the player not being able to play audio when the user did not interact
// with the page
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Catch all unhandled errors
unhandled();

/**
 *  Create Loading Screen
 */

const createLoadingScreen = () => {
  /// create a browser window
  loadingScreen = new BrowserWindow({
    /// define width and height for the window
    width: Settings.has("windowSize") ? Settings.get("windowSize").width : 1333,
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

  loadingScreen.loadURL(`file://${__dirname}/loading.html`);

  if (Settings.has("windowPosition")) {
    const { x, y } = Settings.get("windowPosition");
    loadingScreen.setPosition(x, y);
  } else {
    loadingScreen.center();
  }

  loadingScreen.on("closed", () => (loadingScreen = null));

  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
    loadingScreen.focus();
  });
};

/**
 *  Create App Screen
 */

const createAppScreen = () => {
  mainWindow = new BrowserWindow({
    title: "AYE-Player",
    show: false,
    width: Settings.has("windowSize") ? Settings.get("windowSize").width : 1333,
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

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  if (Settings.has("windowPosition")) {
    const { x, y } = Settings.get("windowPosition");
    mainWindow.setPosition(x, y);
  } else {
    mainWindow.center();
  }

  if (Settings.get("rpcEnabled")) {
    rpc.login();
  }

  mainWindow.on("ready-to-show", () => {
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // Register MPRIS
    if (process.platform === "linux") {
      try {
        new AyeMpris(mainWindow).init();
      } catch (err) {
        console.error(err);
      }
    }

    let isTrusted: boolean;
    if (process.platform === "darwin") {
      isTrusted = systemPreferences.isTrustedAccessibilityClient(true);
    }

    if (
      isTrusted === undefined ||
      (process.platform === "darwin" && isTrusted)
    ) {
      registerMediaKeys(mainWindow);
    }
  });

  tray = new AyeTray(mainWindow);
  tray.init();

  mainWindow.on("close", event => {
    if (Settings.get("minimizeToTray") && !tray.shouldQuit) {
      event.preventDefault();
      mainWindow.hide();
    }

    const [x, y] = mainWindow.getPosition();
    const [width, height] = mainWindow.getSize();

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
    rpc.dispose();
    // unregister shortcuts
    globalShortcut.unregisterAll();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-finish-load", () => {
    /// when the content has loaded, hide the loading screen and show the main window
    if (loadingScreen) {
      loadingScreen.close();
    }

    const lng = Settings.get("language");
    mainWindow.webContents.send("language-changed", {
      language: lng,
      namespace: config.namespace,
      resource: i18n.getResourceBundle(lng, config.namespace)
    });

    i18n.changeLanguage(lng);
  });

  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
  });

  const menuBuilder = new MenuBuilder(mainWindow, i18n);

  menuBuilder.i18n.on("languageChanged", lng => {
    menuBuilder.buildMenu();
    mainWindow.webContents.send("language-changed", {
      language: lng,
      namespace: config.namespace,
      resource: menuBuilder.i18n.getResourceBundle(lng, config.namespace)
    });
  });

  ipcMain.on("changeLang", (_event: any, arg: any) => {
    menuBuilder.i18n.changeLanguage(arg.lang);
  });
};

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
    await installExtensions();
  }

  // Create our screens
  createLoadingScreen();
  createAppScreen();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
});

// macOS only
app.on("activate", () => {
  mainWindow.show();
  mainWindow.focus();
});

// Make the app a single-instance app
const gotTheLock = app.requestSingleInstanceLock();

app.on("second-instance", () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (!gotTheLock) {
  app.quit();
}

// IPC Communication

ipcMain.on("setDiscordActivity", (event: any, arg: any) => {
  if (!rpc && !rpc.isConnected) return;
  rpc.setActivity(arg.playbackPosition, arg.endTime, arg.state, arg.details);
});

ipcMain.on("disableRPC", async () => {
  await rpc.dispose();
});

ipcMain.on("enableRPC", async () => {
  await rpc.login();
});

ipcMain.on("restart", () => {
  app.relaunch();
  app.exit();
});
