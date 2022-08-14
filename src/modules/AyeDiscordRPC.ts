// eslint-disable-line
import AyeLogger from './AyeLogger';
import { LogType } from '../types/enums';
import formattedDuration from '../helpers/formattedDuration';

const { Client } = require('discord-rpc');

interface IActivityParameters {
  details?: string;
  state?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  partyId?: string;
  partySize?: number;
  partyMax?: number;
  matchSecret?: string;
  joinSecret?: string;
  spectateSecret?: string;
  instance?: boolean;
}

class AyeDiscordRPC {
  private rpc: any;

  public isConnected: boolean | undefined;

  private readonly clientId: string;

  private activityTimer: NodeJS.Timer;

  private activityBlocker: NodeJS.Timer | undefined;

  private activity: IActivityParameters | undefined;

  private canSetActivity = true;

  public constructor(clientId: string) {
    this.clientId = clientId;
    this.activityTimer = setInterval(() => {
      if (this.canSetActivity && this.activity) {
        try {
          this.rpc.setActivity(this.activity);
          this.activity = undefined;
          this.canSetActivity = false;
          this.activityBlocker = setTimeout(() => {
            this.canSetActivity = true;
          }, 10000);
        } catch (error) {
          AyeLogger.rpc(`Setting activity ${error}`, LogType.ERROR);
        }
      }
    }, 5000);
  }

  public get client() {
    return this.rpc;
  }

  public async setActivity(
    playbackPosition: number,
    startTimestamp: number,
    endTimestamp: number,
    state: string | null,
    details: string,
    duration: number
  ) {
    if (!this.rpc) return;

    let activityParameters: IActivityParameters;

    if (startTimestamp && duration) {
      // Listen.moe time calc
      activityParameters = {
        details,
        endTimestamp:
          new Date(startTimestamp).getTime() +
          new Date(duration * 1000).getTime(),
        largeImageKey: 'aye',
        smallImageKey: 'play',
        smallImageText: 'Playing',
        instance: false,
      };
    } else if (endTimestamp) {
      activityParameters = {
        details,
        endTimestamp: Math.floor(
          Date.now() / 1000 + (endTimestamp - playbackPosition)
        ),
        largeImageKey: 'aye',
        smallImageKey: 'play',
        smallImageText: 'Playing',
        instance: false,
      };
    } else if (!endTimestamp && state) {
      activityParameters = {
        details,
        state:
          state === 'Paused'
            ? `${formattedDuration(duration - playbackPosition)} left`
            : state,
        largeImageKey: 'aye',
        smallImageKey: state === 'Paused' ? 'pause' : undefined,
        smallImageText: state === 'Paused' ? 'Paused' : undefined,
        instance: false,
      };
    } else {
      activityParameters = {
        details,
        startTimestamp: Math.floor(Date.now() / 1000),
        largeImageKey: 'aye',
        instance: false,
      };
    }

    try {
      if (this.canSetActivity) {
        this.rpc.setActivity(activityParameters);
        this.canSetActivity = false;
        this.activityBlocker = setTimeout(() => {
          this.canSetActivity = true;
        }, 10000);
      } else {
        this.activity = activityParameters;
      }
    } catch (error) {
      AyeLogger.rpc('Setting Activity', LogType.ERROR);
    }
  }

  public async login() {
    if (this.rpc) return;
    this.rpc = new Client({ transport: 'ipc' });
    AyeLogger.rpc('Connecting...');

    try {
      this.rpc.once('ready', async () => {
        AyeLogger.rpc('Successfully connected to Discord.');
        this.isConnected = true;

        await this.setActivity(0, 0, 0, null, 'Idle', 0);
      });

      this.rpc.transport.once('close', async () => {
        await this.dispose();
      });

      await this.rpc.login({ clientId: this.clientId });
    } catch (error) {
      AyeLogger.rpc('Cannot connect to Discord, is it running?');
      this.dispose();
      this.isConnected = false;
    }
  }

  public async dispose() {
    try {
      if (this.rpc) await this.rpc.destroy();
      if (this.activityTimer) clearInterval(this.activityTimer);
      if (this.activityBlocker) clearTimeout(this.activityBlocker);
      // eslint-disable-next-line no-empty
    } catch {}
    this.rpc = null;
  }
}

export default AyeDiscordRPC;
