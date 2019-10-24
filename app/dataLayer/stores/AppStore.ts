import { types, Instance } from "mobx-state-tree";

export type AppStoreModel = Instance<typeof AppStore>;

const AppStore = types
  .model({
    showQueue: types.optional(types.boolean, false)
  })
  .actions(self => ({
    toggleQueueDisplay() {
      self.showQueue = !self.showQueue;
    }
  }));

export default AppStore;
