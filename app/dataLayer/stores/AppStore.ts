import { ipcRenderer } from "electron";
import { types } from "mobx-state-tree";
import Settings from "./PersistentSettings";

export type AppStoreModel = typeof AppStore.Type;

const AppStore = types
  .model({
    showQueue: types.boolean,
    rpcEnabled: types.boolean,
    minimizeToTray: types.boolean,
    language: types.string
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
    },

    async setLanguage(lang: string) {
      self.language = lang;
      Settings.set("language", lang);

      ipcRenderer.send("changeLang", {
        lang
      })
    }
  }));

export default AppStore;
