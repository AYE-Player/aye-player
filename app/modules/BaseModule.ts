import { BrowserWindow } from "electron";

class BaseModule {
  public window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }
}

export default BaseModule;