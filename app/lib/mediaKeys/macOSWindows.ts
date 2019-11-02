import { BrowserWindow } from "electron";
import { globalShortcut } from "electron";

const macOSWindows = (win: BrowserWindow) => {
  globalShortcut.register("MediaPlayPause", () => {
    win.webContents.send("play-pause");
  });

  globalShortcut.register("MediaNextTrack", () => {
    win.webContents.send("play-next");
  });

  globalShortcut.register("MediaPreviousTrack", () => {
    win.webContents.send("play-previous");
  });
};

export default macOSWindows;
