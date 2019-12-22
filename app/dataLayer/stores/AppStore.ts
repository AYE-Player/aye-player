import { ipcRenderer } from "electron";
import { model, Model, modelAction, prop } from "mobx-keystone";
import Settings from "./PersistentSettings";

@model("AppStore")
export default class AppStore extends Model({
  showQueue: prop<boolean>(),
  rpcEnabled: prop<boolean>(),
  devMode: prop(false),
  minimizeToTray: prop<boolean>(),
  language: prop<string>(),
  selectedPlaylist: prop<string>()
}) {
  @modelAction
  toggleQueueDisplay() {
    this.showQueue = !this.showQueue;
  }

  @modelAction
  toggleRPC() {
    this.rpcEnabled = !this.rpcEnabled;
    if (this.rpcEnabled) {
      ipcRenderer.send("enableRPC");
      Settings.set("rpcEnabled", true);
    } else {
      ipcRenderer.send("disableRPC");
      Settings.set("rpcEnabled", false);
    }
  }

  @modelAction
  toggleMinimizeToTray() {
    this.minimizeToTray = !this.minimizeToTray;
    if (this.minimizeToTray) {
      Settings.set("minimizeToTray", true);
    } else {
      Settings.set("minimizeToTray", false);
    }
  }

  @modelAction
  toggleDevMode() {
    this.devMode = !this.devMode;
    if (this.devMode) {
      Settings.set("devMode", true);
    } else {
      Settings.set("devMode", false);
    }
  }

  @modelAction
  setLanguage(lang: string) {
    this.language = lang;
    Settings.set("language", lang);

    ipcRenderer.send("changeLang", {
      lang
    });
  }

  @modelAction
  setActivePlaylist(id: string) {
    this.selectedPlaylist = id;
  }
}
