const { Client } = require('discord-rpc'); // eslint-disable-line

export default class RPCClient {

	private _rpc: any;

	private readonly _clientId: string;

	public constructor(clientId: string) {
		this._clientId = clientId;
	}

	public get client() {
		return this._rpc;
	}

	public async setActivity(endTimestamp: number, state: string, details: string) {
		if (!this._rpc) return;

		this._rpc.setActivity({
			details,
			//state,
			endTimestamp: Math.floor(endTimestamp + Date.now() / 1000),
			largeImageKey: 'aye',
			//smallImageKey: 'aye',
			largeImageText: 'AYE-Player',
			//smallImageText: 'AYE-Player',
			instance: false
		});
	}

	public async login() {
		if (this._rpc) return;
		this._rpc = new Client({ transport: 'ipc' });
		console.log('Logging into RPC.');
		this._rpc.once('ready', async () => {
			console.log('Successfully connected to Discord.');

      await this.setActivity(0, "AYE-Player", "Idle");

		});

		this._rpc.transport.once('close', async () => {
			await this.dispose();
		});

		await this._rpc.login({ clientId: this._clientId });
	}

	public async dispose() {
		try {
			if (this._rpc) await this._rpc.destroy();
		} catch {}
		this._rpc = null;

	}
}
