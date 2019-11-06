const Store = require("electron-store");

const schema = {
  rpcEnabled: {
    type: "boolean",
    default: true
  },
  minimizeToTray: {
    type: "boolean",
    default: false
  },
  language: {
    type: "string",
    default: "en"
  }
};

export default new Store({ schema });
