export enum Repeat {
  NONE = "none",
  ALL = "all",
  ONE = "one"
}

export enum LogType {
  ERROR = "error",
  WARN = "warn",
  INFO = "info"
}

export enum OutgoingMessageType {
  TOGGLE_PLAYING_STATE,
  SET_TRACK,
  PLAY_TRACK,
  SET_LOOPING,
  SEEK,
  VOLUME,
  MUTE
}

export enum IncomingMessageType {
  START,
  PAUSE,
  PLAY_NEXT_TRACK,
  SET_PLAYBACK_POSITION,
  NOTIFY_RPC,
  ERROR
}
