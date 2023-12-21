/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import ytsr from 'ytsr';

const log = require('electron-log');

window.log = log.functions;

window.addEventListener(
  'DOMContentLoaded',
  () => {
    if (process.platform === 'darwin' || process.platform === 'win32') {
      // eslint-disable-next-line no-new
      new Titlebar({
        backgroundColor: TitlebarColor.fromHex('#3D4653'),
        shadow: false,
        maximizable: false,
        icon: '../../assets/icons/24x24_w.png',
      });
    }
  },
  { once: true },
);

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: string, args?: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  process: {
    env: {
      HOT: process.env.HOT,
      NODE_ENV: process.env.NODE_ENV,
      version: require('../../package.json').version,
    },
    platform: process.platform,
  },
  youtube: {
    async search(term: string): Promise<ytsr.Result> {
      const filters = await ytsr.getFilters(term);
      const filter = filters.get('Type')!.get('Video')!;

      return ytsr(filter.url!, { pages: 1 });
    },
  },
  settings: {
    delete(key: string) {
      ipcRenderer.send('setting-delete', key);
    },
    get(key: string) {
      return ipcRenderer.sendSync('setting-get', key);
    },
    has(key: string) {
      return ipcRenderer.sendSync('setting-has', key);
    },
    set(property: string, val: any) {
      ipcRenderer.send('setting-set', property, val);
    },
  },
});
