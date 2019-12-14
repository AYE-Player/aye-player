import { ipcRenderer } from "electron";
import { types } from "mobx-state-tree";
import Settings from "./PersistentSettings";

export type AppStoreModel = typeof AppStore.Type;

const AppStore = types
  .model({
    showQueue: types.boolean,
    rpcEnabled: types.boolean,
    devMode: types.optional(types.boolean, false),
    minimizeToTray: types.boolean,
    language: types.string,
    activePlaylist: types.maybe(types.string)
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

    toggleDevMode() {
      self.devMode = !self.devMode;
      if (self.devMode) {
        Settings.set("devMode", true);
      } else {
        Settings.set("devMode", false);
      }
    },

    setLanguage(lang: string) {
      self.language = lang;
      Settings.set("language", lang);

      ipcRenderer.send("changeLang", {
        lang
      });
    },

    setActivePlaylist(id: string) {
      self.activePlaylist = id;
    }
  }));

export default AppStore;
