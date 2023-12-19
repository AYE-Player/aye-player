/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import {
  app,
  BrowserWindow,
  ipcMain,
  systemPreferences,
  globalShortcut,
} from 'electron';
import unhandled from 'electron-unhandled';
import 'v8-compile-cache';
import path from 'path';
import { IDiscordActivity } from '../types/response';
import { Channel } from '../types/enums';
import config from '../configs/app.config';
import i18n from '../configs/i18next.config';
import Settings from '../renderer/dataLayer/stores/PersistentSettings';
import AyeDiscordRPC from '../modules/AyeDiscordRPC';
import AyeLogger from '../modules/AyeLogger';
import AyeMediaKeys from '../modules/AyeMediaKeys';
import AyeMenu from '../modules/AyeMenu';
import AyeMpris from '../modules/AyeMpris';
import AyeTray from '../modules/AyeTray';
import { resolveHtmlPath } from './util';

const {
  setupTitlebar,
  attachTitlebarToWindow,
} = require('custom-electron-titlebar/main');

let mainWindow: BrowserWindow | null = null;
let loadingScreen: BrowserWindow | null = null;
let tray: AyeTray;
let mediaKeys: AyeMediaKeys;
let rpc: AyeDiscordRPC;
let mpris: AyeMpris;
let menu: AyeMenu;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}
// Fix the player not being able to play audio when the user did not interact
// with the page
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// Disable the http cache, to always load newest version of external player
app.commandLine.appendSwitch('disable-http-cache');
// Set default protocol, to open pages/songs with an external link
app.setAsDefaultProtocolClient('aye-player');

// Catch all unhandled errors
unhandled();

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createLoadingScreen = () => {
  /// create a browser window
  loadingScreen = new BrowserWindow({
    /// define width and height for the window
    width: Settings.has('windowSize')
      ? Settings.get('windowSize')!.width
      : 1390,
    minWidth: 1390,
    height: Settings.has('windowSize')
      ? Settings.get('windowSize')!.height
      : 728,
    minHeight: 728,
    /// remove the window frame, so it will become a frameless window
    frame: false,
    /// and set the transparency, to remove any window background color
    transparent: true,
    webPreferences: {
      contextIsolation: false,
    },
    icon: `${__dirname}/images/icons/png/256x256_w.png`,
  });

  loadingScreen.loadURL(`file://${__dirname}/loading.html`);

  if (Settings.has('windowPosition')) {
    const { x, y } = Settings.get('windowPosition')!;
    loadingScreen.setPosition(x, y);
  } else {
    loadingScreen.center();
  }

  loadingScreen.on('closed', () => {
    loadingScreen = null;
  });

  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen!.show();
    loadingScreen!.focus();
  });
};

const createAppScreen = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    title: 'AYE-Player',
    show: true,
    width: Settings.has('windowSize')
      ? Settings.get('windowSize')!.width
      : 1390,
    minWidth: 1390,
    height: Settings.has('windowSize')
      ? Settings.get('windowSize')!.height
      : 728,
    minHeight: 728,
    frame: process.platform !== 'win32',
    titleBarStyle: 'hidden',
    maximizable: false,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    icon: `${__dirname}/images/icons/png/256x256_w.png`,
  });

  mainWindow.setMenuBarVisibility(false);
  // mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  if (process.platform === 'darwin' || process.platform === 'win32') {
    setupTitlebar();
    attachTitlebarToWindow(mainWindow);
  }

  if (Settings.has('windowPosition')) {
    const { x, y } = Settings.get('windowPosition')!;
    mainWindow.setPosition(x, y);
  } else {
    mainWindow.center();
  }

  if (!rpc) {
    // Create DiscordRPC
    rpc = new AyeDiscordRPC('621726681140297728');
  }

  if (!tray) {
    // Create Tray
    tray = new AyeTray(mainWindow, i18n);

    tray.i18n.on('languageChanged', () => {
      tray.rebuild();
    });
  }

  if (Settings.get('rpcEnabled')) {
    rpc.login();
  }

  mainWindow.on('ready-to-show', () => {
    if (process.env.START_MINIMIZED) {
      mainWindow!.minimize();
    } else {
      mainWindow!.show();
    }

    // Register MPRIS
    if (process.platform === 'linux') {
      try {
        mpris = new AyeMpris(mainWindow!);
      } catch (error) {
        AyeLogger.main(
          `Error registering Mpris ${JSON.stringify(error, null, 2)}`,
        );
      }
    }

    let isTrusted: boolean;
    if (
      process.platform === 'darwin' &&
      !systemPreferences.isTrustedAccessibilityClient(false)
    ) {
      isTrusted = systemPreferences.isTrustedAccessibilityClient(true);
    } else {
      isTrusted = true;
    }

    // Register media keys
    if (
      isTrusted === undefined ||
      (process.platform === 'darwin' && isTrusted)
    ) {
      mediaKeys = new AyeMediaKeys(mainWindow!);
    }
  });

  mainWindow.on('close', (event) => {
    if (Settings.get('minimizeToTray') && !tray.shouldQuit) {
      event.preventDefault();
      tray.hideToTray();
      return;
    }

    mainWindow!.webContents.send('app-close');

    const [x, y] = mainWindow!.getPosition();
    const [width, height] = mainWindow!.getSize();

    // save windows position and size
    Settings.set('windowSize', {
      height,
      width,
    });

    Settings.set('windowPosition', {
      x,
      y,
    });

    // dispose of rpc client
    rpc.dispose();
    // dispose of tray
    tray.destroy();
    // unregister shortcuts
    globalShortcut.unregisterAll();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    /// when the content has loaded, hide the loading screen and show the main window
    if (loadingScreen) {
      loadingScreen.destroy();
    }

    const lng = Settings.get('language');
    mainWindow!.webContents.send('language-changed', {
      language: lng,
      namespace: config.namespace,
      resource: i18n.getResourceBundle(lng, config.namespace),
    });

    i18n.changeLanguage(lng);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('/watch?v=')) {
      mainWindow!.webContents.send('play-song', {
        id: url.split('/watch?v=')[1],
      });
    }

    return { action: 'deny' };
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return {
      action: 'allow',
    };
  });

  menu = new AyeMenu(mainWindow, i18n);

  menu.i18n.on('languageChanged', (lng) => {
    menu.build();
    mainWindow!.webContents.send('language-changed', {
      language: lng,
      namespace: config.namespace,
      resource: menu.i18n.getResourceBundle(lng, config.namespace),
    });
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createLoadingScreen();
    createAppScreen();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      // Create our screens
      if (mainWindow === null) {
        createAppScreen();
      } else {
        mainWindow.show();
      }
    });
    // Make the app a single-instance app
    const gotTheLock = app.requestSingleInstanceLock();

    app.on('second-instance', (event, args) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }

      // See if we have a custom scheme notification, and note that Chromium may add its own parameters
      for (const arg of args) {
        const value = arg as string;
        if (value.indexOf('aye-player') !== -1) {
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
    app.on('open-url', (event, customSchemeData) => {
      event.preventDefault();

      mainWindow!.webContents.send('play-song', {
        id: customSchemeData.split('://')[1],
      });
    });

    // IPC Communication

    ipcMain.on(
      Channel.SET_DISCORD_ACTIVITY,
      (
        _event: any,
        {
          details,
          duration,
          endTimestamp,
          playbackPosition,
          state,
        }: IDiscordActivity,
      ) => {
        if (!rpc?.isConnected) return;
        rpc.setActivity(
          playbackPosition,
          endTimestamp,
          state,
          details,
          duration,
        );
      },
    );

    ipcMain.on(Channel.DISABLE_RPC, async () => {
      await rpc.dispose();
    });

    ipcMain.on(Channel.ENABLE_RPC, async () => {
      await rpc.login();
    });

    ipcMain.on(Channel.DISABLE_TRAY, () => {
      tray.removeTray();
    });

    ipcMain.on(Channel.ENABLE_TRAY, () => {
      tray.showTray();
    });

    ipcMain.on(Channel.RESTART, () => {
      app.relaunch();
      app.exit();
    });

    ipcMain.on(
      Channel.CHANGE_LANGUAGE,
      (_event: any, arg: { lang: string | undefined }) => {
        menu.i18n.changeLanguage(arg.lang);
        tray.i18n.changeLanguage(arg.lang);
      },
    );

    ipcMain.on(Channel.RELOAD_MAIN_WINDOW, (_event) => {
      mainWindow?.reload();
    });

    ipcMain.on(Channel.OPEN_SPOTIFY_LOGIN_WINDOW, () => {
      const SPOTIFY_CALLBACK_URL = 'https://aye-playr.de/spotify-catch';
      const SPOTIFY_CLIENT_ID = '4f1d7c536d8e4ed384931270fcbfb82f';

      const parseURL = (url: string): string => {
        if (!url.startsWith(SPOTIFY_CALLBACK_URL)) return '';
        const query = url.split('#')[1].split('&');
        if (query.find((q) => q.startsWith('error'))) return '';
        const accessToken = query
          .find((q) => q.startsWith('access_token'))
          ?.split('=')[1];

        mainWindow?.webContents.send(Channel.GOT_SPOTIFY_TOKEN, accessToken);
        return accessToken ?? '';
      };

      const getAuthenticationURL = () => {
        const scopes = 'playlist-read-private playlist-read-collaborative';
        const link = 'https://accounts.spotify.com/authorize';
        return `${link}?response_type=token&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(
          scopes,
        )}&redirect_uri=${encodeURIComponent(SPOTIFY_CALLBACK_URL)}`;
      };

      let spotifyWin: BrowserWindow | null;

      const destroyAuthWin = () => {
        if (!spotifyWin) return;
        spotifyWin.close();
        spotifyWin = null;
      };

      spotifyWin = new BrowserWindow({
        width: 1000,
        height: 600,
      });

      spotifyWin.loadURL(getAuthenticationURL());

      const filter = {
        urls: [`${SPOTIFY_CALLBACK_URL}`],
      };

      spotifyWin.webContents.session.webRequest.onBeforeRequest(
        filter,
        ({ url }, _callback) => {
          mainWindow?.webContents.send(
            Channel.GOT_SPOTIFY_TOKEN,
            parseURL(url),
          );
          destroyAuthWin();
        },
      );

      spotifyWin.on('closed', () => {
        spotifyWin = null;
      });
    });

    ipcMain.on(
      Channel.LOG,
      (
        _event: any,
        {
          message,
          type = 'info',
        }: { message: string; service: string; type: string },
      ) => {
        AyeLogger.player(message, type);
      },
    );

    ipcMain.on(Channel.SETTING_GET, (event, val) => {
      event.returnValue = Settings.get(val);
    });

    ipcMain.on(Channel.SETTING_SET, (_event, key, val) => {
      Settings.set(key, val);
    });

    ipcMain.on(Channel.SETTING_DELETE, (_event, key) => {
      Settings.delete(key);
    });

    ipcMain.on(Channel.SETTING_HAS, (event, key) => {
      event.returnValue = Settings.has(key);
    });
  })
  .catch(console.log);
