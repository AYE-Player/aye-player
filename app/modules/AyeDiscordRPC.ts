const { Client } = require("discord-rpc"); // eslint-disable-line
import AyeLogger from "./AyeLogger";
import { LogType } from "../types/enums";
import formattedDuration from "../helpers/formattedDuration";

interface IActivityParameters {
  details?: string;
  state?: string;
  startTimestamp?: number | null;
  endTimestamp?: number | null;
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

export default class AyeDiscordRPC {
  private _rpc: any;

  public isConnected: boolean;

  private readonly _clientId: string;

  private _activityTimer: number;
  private _activityBlocker: number;
  private _activity: IActivityParameters;
  private _canSetActivity = true;

  public constructor(clientId: string) {
    this._clientId = clientId;
    this._activityTimer = setInterval(() => {
      if (this._canSetActivity && this._activity) {
        try {
          this._rpc.setActivity(this._activity);
          this._activity = null;
          this._canSetActivity = false;
          this._activityBlocker = setTimeout(() => {
            this._canSetActivity = true;
          }, 10000);
        } catch (error) {
          AyeLogger.rpc(`Setting activity ${error}`, LogType.ERROR);
        }
      }
    }, 5000);
  }

  public get client() {
    return this._rpc;
  }

  public async setActivity(
    playbackPosition: number,
    endTimestamp: number,
    state: string,
    details: string,
    duration: number
  ) {
    if (!this._rpc) return;

    let activityParameters: IActivityParameters;

    if (endTimestamp) {
      activityParameters = {
        details,
        endTimestamp: Math.floor(
          Date.now() / 1000 + (endTimestamp - playbackPosition)
        ),
        largeImageKey: "aye",
        smallImageKey: "play",
        smallImageText: "Playing",
        instance: false
      };
    } else if (!endTimestamp && state) {
      activityParameters = {
        details,
        state:
          state === "Paused"
            ? `${formattedDuration(duration - playbackPosition)} left`
            : state,
        largeImageKey: "aye",
        smallImageKey: state === "Paused" ? "pause" : undefined,
        smallImageText: state === "Paused" ? "Paused" : undefined,
        instance: false
      };
    } else {
      activityParameters = {
        details,
        startTimestamp: Math.floor(Date.now() / 1000),
        largeImageKey: "aye",
        instance: false
      };
    }

    try {
      if (this._canSetActivity) {
        this._rpc.setActivity(activityParameters);
        this._canSetActivity = false;
        this._activityBlocker = setTimeout(() => {
          this._canSetActivity = true;
        }, 10000);
      } else {
        this._activity = activityParameters;
      }
    } catch (error) {
      AyeLogger.rpc("Setting Activity", LogType.ERROR);
    }
  }

  public async login() {
    if (this._rpc) return;
    this._rpc = new Client({ transport: "ipc" });
    AyeLogger.rpc("Connecting...");

    try {
      this._rpc.once("ready", async () => {
        AyeLogger.rpc("Successfully connected to Discord.");
        this.isConnected = true;

        await this.setActivity(0, 0, null, "Idle", 0);
      });

      this._rpc.transport.once("close", async () => {
        await this.dispose();
      });

      await this._rpc.login({ clientId: this._clientId });
    } catch (error) {
      AyeLogger.rpc("Cannot connect to Discord, is it running?");
      this.dispose();
      this.isConnected = false;
    }
  }

  public async dispose() {
    try {
      if (this._rpc) await this._rpc.destroy();
      if (this._activityTimer) clearInterval(this._activityTimer);
      if (this._activityBlocker) clearTimeout(this._activityBlocker);
    } catch {}
    this._rpc = null;
  }
}
