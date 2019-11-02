const Store = require("electron-store");

const schema = {
  rpcEnabled: {
    type: "boolean",
    default: true
  },
  minimizeToTray: {
    type: "boolean",
    default: false
  }
};

export default new Store({ schema });
