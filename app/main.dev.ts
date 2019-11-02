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
  ipcMain,
  Tray,
  Menu,
  systemPreferences,
  globalShortcut
} from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import MenuBuilder from "./menu";
import RPCClient from "./rpcClient";
import Settings from "./dataLayer/stores/PersistentSettings";
import unhandled from "electron-unhandled";

import mprisService from "./lib/mprisService";
import registerMediaKeys from "./lib/registerMediaKeys";

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
let tray: Tray = null;
let rpc = new RPCClient("621726681140297728");

// Fix the player not being able to play audio when the user did not interact
// with the page
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

let shouldQuit = false;

/**
 *  Create Loading Screen
 */

const createLoadingScreen = () => {
  /// create a browser window
  loadingScreen = new BrowserWindow({
    /// define width and height for the window
    width: Settings.has("windowSize") ? Settings.get("windowSize").width : 1280,
    minWidth: 1280,
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
    width: Settings.has("windowSize") ? Settings.get("windowSize").width : 1280,
    minWidth: 1280,
    height: Settings.has("windowSize")
      ? Settings.get("windowSize").height
      : 728,
    minHeight: 728,
    frame: true,
    titleBarStyle: "hidden",
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  tray = new Tray(`${__dirname}/../resources/icons/16x16.png`);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function() {
        mainWindow.show();
      }
    },
    {
      label: "Quit",
      click: function() {
        shouldQuit = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip("AYE - Player");
  tray.on("click", () => {
    mainWindow.show();
    mainWindow.focus();
  });

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
      mainWindow.focus();
    }

    // Register Media Keys and MPRIS after loading is finished, to prevent attaching mpris/keys to
    // the loading screen and create a second - dead - registration for mpris

    // Register MPRIS
    if (process.platform === "linux") {
      try {
        mprisService(mainWindow, app);
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
      (process.env.platform === "darwin" && isTrusted)
    ) {
      registerMediaKeys(mainWindow);
    }
  });

  mainWindow.on("close", event => {
    if (Settings.get("minimizeToTray") && !shouldQuit) {
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

    mainWindow.show();
  });

  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  unhandled();
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
  new AppUpdater();
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
