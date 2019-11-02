import linux from "./mediaKeys/linux";
import macOSWindows from "./mediaKeys/macOSWindows";
import { BrowserWindow } from "electron";

const OS = process.platform;

const registerMediaKeys = (win: BrowserWindow) => {
  // eslint-disable-line consistent-return
  if (OS === "linux") {
    return linux(win);
  }
  if (OS === "win32" || OS === "darwin") {
    return macOSWindows(win);
  }
};

export default registerMediaKeys;
