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
  PLAY_STREAM,
  SET_LOOPING,
  SEEK,
  VOLUME,
  MUTE,
  INIT
}

export enum IncomingMessageType {
  START,
  PAUSE,
  READY,
  PLAY_NEXT_TRACK,
  SET_PLAYBACK_POSITION,
  NOTIFY_RPC,
  ERROR
}
