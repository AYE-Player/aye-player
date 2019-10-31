import { BrowserWindow } from "electron";
import { globalShortcut } from "electron";

const macOSWindows = (win: BrowserWindow) => {
  globalShortcut.register("MediaPlayPause", () => {
    win.webContents.send("play-pause");
  });

  globalShortcut.register("MediaNextTrack", () => {
    console.log("Executing play-next media key command");
    win.webContents.send("play-next");
  });

  globalShortcut.register("MediaPreviousTrack", () => {
    console.log("Executing play-previous media key command");
    win.webContents.send("play-previous");
  });
};

export default macOSWindows;
