import { ipcRenderer } from "electron";
import { Instance, types } from "mobx-state-tree";
import Settings from "./PersistentSettings";

export type AppStoreModel = Instance<typeof AppStore>;

const AppStore = types
  .model({
    showQueue: types.optional(types.boolean, false),
    rpcEnabled: types.boolean,
    minimizeToTray: types.boolean
  })
  .actions(self => ({
    toggleQueueDisplay() {
      self.showQueue = !self.showQueue;
    },

    toggleRPC() {
      self.rpcEnabled = !self.rpcEnabled;
      if (self.rpcEnabled) {
        ipcRenderer.send("enableRPC");
        Settings.set("rpcEnabled", true);
      } else {
        ipcRenderer.send("disableRPC");
        Settings.set("rpcEnabled", false);
      }
    },

    toggleMinimizeToTray() {
      self.minimizeToTray = !self.minimizeToTray;
      if (self.minimizeToTray) {
        Settings.set("minimizeToTray", true);
      } else {
        Settings.set("minimizeToTray", false);
      }

      ipcRenderer.send("restart");
    }
  }));

export default AppStore;
