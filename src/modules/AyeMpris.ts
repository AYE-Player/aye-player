import { app, BrowserWindow, ipcMain } from 'electron';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mpris from 'mpris-service';
import { Channel } from '../types/enums';
import AyeLogger from './AyeLogger';
import BaseModule from './BaseModule';

class AyeMpris extends BaseModule {
  private player: any;

  constructor(win: BrowserWindow) {
    super(win);
    this.player = mpris({
      name: 'ayeplayer',
      identity: 'AYE Player',
      canRaise: true,
      supportedUriSchemes: ['https'],
      supportedInterfaces: ['player'],
      desktopEntry: 'ayeplayer',
    });

    this.player.playbackStatus = 'Stopped';
    this.player.rate = 1;
    this.player.canSeek = true;
    this.player.canControl = true;
    this.player.minimumRate = 1;
    this.player.maximumRate = 1;
    this.player.volume = 0.2;

    this.player.on('raise', () => {
      AyeLogger.media('Window raised');
      this.window.show();
    });

    this.player.on('quit', () => {
      AyeLogger.media('Quitting Aye');
      app.exit();
    });

    this.player.on('rate', () => {
      AyeLogger.media('Attempting to change rate');
      this.player.rate = 1;
    });

    this.player.on('playpause', () => {
      AyeLogger.media('Play-Pause received');
      if (
        this.player.playbackStatus === 'Playing' ||
        this.player.playbackStatus === 'Paused'
      ) {
        this.executeMediaKey(this.window, 'play-pause');
      }
    });

    this.player.on('play', () => {
      AyeLogger.media('Play received');
      if (
        this.player.playbackStatus === 'Paused' ||
        this.player.playbackStatus === 'Stopped'
      ) {
        this.executeMediaKey(this.window, 'play-pause');
      }
    });

    this.player.on('pause', () => {
      AyeLogger.media('Pause received');
      if (this.player.playbackStatus === 'Playing') {
        this.executeMediaKey(this.window, 'play-pause');
      }
    });

    this.player.on('next', () => {
      AyeLogger.media('Next received');
      if (
        this.player.playbackStatus === 'Playing' ||
        this.player.playbackStatus === 'Paused'
      ) {
        this.executeMediaKey(this.window, 'play-next');
      }
    });

    this.player.on('previous', () => {
      AyeLogger.media('Previous received');
      if (
        this.player.playbackStatus === 'Playing' ||
        this.player.playbackStatus === 'Paused'
      ) {
        this.executeMediaKey(this.window, 'play-previous');
      }
    });

    this.player.on('volume', (vol: number) => {
      if (this.player.playbackStatus !== 'Stopped') {
        let volume = vol;
        if (vol > 1) {
          volume = 1;
        }
        if (vol < 0) {
          volume = 0;
        }

        AyeLogger.media(`Volume received, set to: ${volume}`);
        this.changeVolumeState(this.window, volume * 100);
        this.window.webContents.send('win2Player', {
          type: 'setVolume',
          info: volume * 100,
        });
        this.player.volume = volume;
      }
    });

    this.player.on('seek', (seek: number) => {
      if (this.player.playbackStatus !== 'Stopped') {
        AyeLogger.media(`Seek ${seek / 1e6} sec`);
        this.window.webContents.send(Channel.PLAYER_2_WIN, {
          type: 'seekTo',
          info: (this.player.getPosition() + seek) / 1e6,
        }); // in seconds
      }
    });

    this.player.on('position', (arg: { position: number }) => {
      if (this.player.playbackStatus !== 'Stopped') {
        AyeLogger.media(`Go to position ${arg.position / 1e6} sec`);
        this.window.webContents.send('position', {
          type: 'seekTo',
          pos: arg.position / 1e6,
        }); // in seconds
      }
    });

    this.player.on('shuffle', (shuffle: boolean) => {
      if (this.player.playbackStatus !== 'Stopped') {
        AyeLogger.media(`Set shuffling: ${shuffle}`);
        this.window.webContents.send(Channel.PLAYER_2_WIN, {
          type: 'onMprisShuffle',
          info: shuffle,
        });
        this.player.shuffle = shuffle;
      }
    });

    this.player.on('loopStatus', (loop: string) => {
      if (this.player.playbackStatus !== 'Stopped') {
        AyeLogger.media(`Set looping to: ${loop}`);
        this.player.loopStatus = loop;
        let repeat = null;
        if (loop === 'Track') repeat = 'one';
        if (loop === 'Playlist') repeat = 'all';
        if (loop === 'None') repeat = null;
        this.window.webContents.send(Channel.PLAYER_2_WIN, {
          type: 'onMprisRepeat',
          info: repeat,
        });
      }
    });

    ipcMain.on(
      Channel.WIN_2_PLAYER,
      (_e, args: { type: string; data: any }) => {
        switch (args.type) {
          case 'setVolume':
            this.player.volume = args.data / 100;
            break;
          case 'seekTo':
            this.player.seeked(args.data * 1e6); // in microseconds
            break;
          case 'shuffle':
            this.player.shuffle = args.data;
            break;
          case 'repeat':
            if (args.data === 'one') this.player.loopStatus = 'Track';
            if (args.data === 'all') this.player.loopStatus = 'Playlist';
            if (args.data === null) this.player.loopStatus = 'None';
            break;
          default:
        }
      },
    );

    ipcMain.on(
      Channel.PLAYER_2_WIN,
      (_e, args: { type: string; data: any }) => {
        switch (args.type) {
          case 'currentTime':
            this.player.getPosition = () => args.data * 1e6; // in microseconds
            break;
          case 'onStateChange':
            if (args.data === true) this.player.playbackStatus = 'Playing';
            if (args.data === false) this.player.playbackStatus = 'Paused';
            break;
          case 'trackInfo':
            this.player.metadata = {
              /* "xesam:artist": [args.data.artist], */
              'xesam:title': args.data.title,
              'xesam:url': `https://www.youtube.com/watch?v=${args.data.id}`,
              'mpris:trackid': this.player.objectPath('track/0'),
              'mpris:artUrl': `https://img.youtube.com/vi/${args.data.id}/hqdefault.jpg`,
              'mpris:length': args.data.duration * 1e6, // in microseconds
            };
            break;
          case 'isRadio':
            this.player.canControl = false;
            break;
          case 'isYoutube':
            this.player.canControl = true;
            break;
          default:
            break;
        }
      },
    );
  }

  executeMediaKey = (win: BrowserWindow, key: string) => {
    AyeLogger.info(`Sending key: ${key}`);
    win.webContents.send(key);
  };

  changeVolumeState = (win: BrowserWindow, volume: number) => {
    win.webContents.executeJavaScript(`
      window.changeVolumeSate(${volume})
    `);
  };
}

export default AyeMpris;
