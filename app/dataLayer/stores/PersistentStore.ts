const Store = require("electron-store");

const schema = {
  rpcEnabled: {
    type: "boolean",
    default: true
  }
};

export default new Store({ schema });
