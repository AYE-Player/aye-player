/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain, Tray, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import MenuBuilder from "./menu";
import RPCClient from "./rpcClient";
import Settings from "./dataLayer/stores/PersistentSettings";
import unhandled from "electron-unhandled";

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

  if (Settings.get("windowPosition")) {
    const { x, y } = Settings.get("windowPosition");
    loadingScreen.setPosition(x, y);
  } else {
    loadingScreen.center();
  }

  loadingScreen.on("closed", () => (loadingScreen = null));

  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
  });
};

const createAppScreen = () => {
  mainWindow = new BrowserWindow({
    title: "AYE-Player",
    show: false,
    width: Settings.get("windowSize") ? Settings.get("windowSize").width : 1280,
    minWidth: 1280,
    height: Settings.get("windowSize")
      ? Settings.get("windowSize").height
      : 728,
    minHeight: 728,
    frame: false,
    titleBarStyle: "hidden",
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  tray = new Tray(`${__dirname}/images/dd.png`);
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

  if (Settings.get("windowPosition")) {
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
  });

  mainWindow.on("close", () => {
    const [x, y] = mainWindow.getPosition();
    const [width, height] = mainWindow.getSize();
    Settings.set("windowSize", {
      height,
      width
    });
    Settings.set("windowPosition", {
      x,
      y
    });
    rpc.dispose();
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
