const { contextBridge } = require("electron");
const customTitleBar = require("pj-custom-electron-titlebar");

contextBridge.exposeInMainWorld(
  "process",
  {
    env: process.env,
    platform: process.platform,
  },
  "ctb",
  {
    customTitleBar,
  }
);
