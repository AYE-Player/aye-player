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
  showNotifications: {
    type: "boolean",
    default: true
  },
  devMode: {
    type: "boolean",
    default: false
  },
  autoRadio: {
    type: "boolean",
    default: false
  },
  language: {
    type: "string",
    default: "en"
  },
  playerSettings: {
    volume: {
      type: "number",
      default: 0.2
    },
    playbackPosition: {
      type: "number",
      default: 0
    },
    currentTrack: {
      type: "object"
    },
    currentPlaylist: {
      type: "object"
    },
    repeat: {
      type: "number",
      default: 0
    },
    isShuffling: {
      type: "boolean",
      default: false
    },
    isMuted: {
      type: "boolean",
      default: false
    }
  }
};

export default new Store({ schema });
