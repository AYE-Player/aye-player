export enum Repeat {
  NONE = 'none',
  PLAYLIST = 'playlist',
  ONE = 'one',
}

export enum LogType {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
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
  INIT,
  RECONNECT_STREAM,
}

export enum IncomingMessageType {
  START,
  PAUSE,
  READY,
  PLAY_NEXT_TRACK,
  SET_PLAYBACK_POSITION,
  NOTIFY_RPC,
  ERROR,
}

export enum Channel {
  APP_CLOSE = 'app-close',
  CHANGE_LANGUAGE = 'change-language',
  DISABLE_RPC = 'disable-rpc',
  DISABLE_TRAY = 'disable-tray',
  ENABLE_TRAY = 'enable-tray',
  ENABLE_RPC = 'enable-rpc',
  GOT_SPOTIFY_TOKEN = 'got-spotify-token',
  LANGUAGE_CHANGED = 'language-changed',
  LOG = 'log',
  OPEN_SPOTIFY_LOGIN_WINDOW = 'open-spotify-login-window',
  PLAY_PAUSE = 'play-pause',
  PLAY_NEXT = 'play-next',
  PLAY_SONG = 'play-song',
  PLAY_PREVIOUS = 'play-previous',
  PLAYER_2_WIN = 'player-2-win',
  POSITION = 'position',
  RECONNECT_STREAM = 'reconnect-stream',
  RELOAD_MAIN_WINDOW = 'reload-main-window',
  RESTART = 'restart',
  SET_DISCORD_ACTIVITY = 'set-discord-activity',
  SETTING_DELETE = 'setting-delete',
  SETTING_GET = 'setting-get',
  SETTING_HAS = 'setting-has',
  SETTING_SET = 'setting-set',
  STREAM_PAUSED = 'stream-paused',
  WIN_2_PLAYER = 'win-2-player',
}
