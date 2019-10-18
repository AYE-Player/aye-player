const { Client } = require("discord-rpc"); // eslint-disable-line

interface IActivityParameters {
  details: string;
  state?: string;
  endTimestamp?: number;
  largeImageKey: string;
  instance: boolean;
}

export default class RPCClient {
  private _rpc: any;

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
        largeImageKey: "aye",
        instance: false
      };
    }

    try {
      this._rpc.setActivity(activityParameters);
    } catch (error) {
      console.log(error);
    }
  }

  public async login() {
    if (this._rpc) return;
    this._rpc = new Client({ transport: "ipc" });
    console.log("Logging into RPC.");

    try {
      this._rpc.once("ready", async () => {
        console.log("Successfully connected to Discord.");

        await this.setActivity(0, 0, null, "Idle");
      });

      this._rpc.transport.once("close", async () => {
        await this.dispose();
      });

      await this._rpc.login({ clientId: this._clientId });
    } catch (error) {
      console.log("Cannot connect to Discord, is it running?");
    }
  }

  public async dispose() {
    try {
      if (this._rpc) await this._rpc.destroy();
    } catch {}
    this._rpc = null;
  }
}
