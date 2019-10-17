/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import MenuBuilder from "./menu";
import RPCClient from "./rpcClient";

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

let mainWindow = null;
let loadingScreen = null;
let rpc = new RPCClient("621726681140297728");

ipcMain.on("setDiscordActivity", (event: any, arg: any) => {
  rpc.setActivity(arg.playbackPosition, arg.endTime, arg.state, arg.details);
});

const createLoadingScreen = () => {
  /// create a browser window
  loadingScreen = new BrowserWindow({
    /// define width and height for the window
    width: 1280,
    height: 728,
    /// remove the window frame, so it will become a frameless window
    frame: false,
    /// and set the transparency, to remove any window background color
    transparent: true
  });

  loadingScreen.setResizable(false);

  loadingScreen.loadURL(`file://${__dirname}/loading.html`);

  loadingScreen.on("closed", () => (loadingScreen = null));

  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
  });
};

const createAppScreen = () => {
  mainWindow = new BrowserWindow({
    title: "AYE-Player",
    show: false,
    width: 1280,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  rpc.login();

  mainWindow.on("ready-to-show", () => {
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
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
