const { Client } = require("discord-rpc"); // eslint-disable-line
import Logger from "../lib/ayeLogger";

interface IActivityParameters {
  details: string;
  state?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  largeImageKey: string;
  instance: boolean;
}

export default class RPCClient {
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
        this._rpc.setActivity(this._activity);
        this._activity = null;
        this._canSetActivity = false;
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
    details: string
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
        instance: false
      };
    } else if (!endTimestamp && state) {
      activityParameters = {
        details,
        state,
        largeImageKey: "aye",
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
      Logger.rpc(error);
    }
  }

  public async login() {
    if (this._rpc) return;
    this._rpc = new Client({ transport: "ipc" });
    Logger.rpc("[RPC] Connecting...");

    try {
      this._rpc.once("ready", async () => {
        Logger.rpc("[RPC] Successfully connected to Discord.");
        this.isConnected = true;

        await this.setActivity(0, 0, null, "Idle");
      });

      this._rpc.transport.once("close", async () => {
        await this.dispose();
      });

      await this._rpc.login({ clientId: this._clientId });
    } catch (error) {
      Logger.rpc("[RPC] Cannot connect to Discord, is it running?");
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
