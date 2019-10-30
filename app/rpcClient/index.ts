const { Client } = require("discord-rpc"); // eslint-disable-line

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

  public constructor(clientId: string) {
    this._clientId = clientId;
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
      this._rpc.setActivity(activityParameters);
    } catch (error) {
      console.log("[RPC] ", error);
    }
  }

  public async login() {
    if (this._rpc) return;
    this._rpc = new Client({ transport: "ipc" });
    console.log("[RPC] Connecting...");

    try {
      this._rpc.once("ready", async () => {
        console.log("[RPC] Successfully connected to Discord.");
        this.isConnected = true;

        await this.setActivity(0, 0, null, "Idle");
      });

      this._rpc.transport.once("close", async () => {
        await this.dispose();
      });

      await this._rpc.login({ clientId: this._clientId });
    } catch (error) {
      console.log("[RPC] Cannot connect to Discord, is it running?");
      this.dispose();
      this.isConnected = false;
    }
  }

  public async dispose() {
    try {
      if (this._rpc) await this._rpc.destroy();
    } catch {}
    this._rpc = null;
  }
}
