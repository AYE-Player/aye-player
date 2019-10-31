import { BrowserWindow } from "electron";
import { globalShortcut } from "electron";

const macOSWindows = (win: BrowserWindow) => {
  globalShortcut.register("MediaPlayPause", () => {
    console.log("Executing play-pause media key command");
    win.webContents.send("play");
  });

  globalShortcut.register("MediaNextTrack", () => {
    console.log("Executing play-next media key command");
    win.webContents.send("skipTrack");
  });

  globalShortcut.register("MediaPreviousTrack", () => {
    console.log("Executing play-previous media key command");
    win.webContents.send("previousTrack");
  });

  globalShortcut.register("CommandOrControl+P", () => {
    win.webContents.send("play");
  });
};

export default macOSWindows;
