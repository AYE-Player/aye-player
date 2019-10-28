import { types, Instance } from "mobx-state-tree";
import { ipcRenderer } from "electron";
import Store from "./PersistentStore";

export type AppStoreModel = Instance<typeof AppStore>;

const AppStore = types
  .model({
    showQueue: types.optional(types.boolean, false),
    rpcEnabled: types.optional(types.boolean, true)
  })
  .actions(self => ({
    toggleQueueDisplay() {
      self.showQueue = !self.showQueue;
    },

    toggleRPC() {
      self.rpcEnabled = !self.rpcEnabled;
      if (self.rpcEnabled) {
        ipcRenderer.send("enableRPC");
        Store.set('rpcEnabled', true);
      } else {
        ipcRenderer.send("disableRPC");
        Store.set('rpcEnabled', false);
      }
    }
  }));

export default AppStore;
