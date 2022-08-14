import log from 'electron-log';
import ytsr from 'ytsr';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: string, args?: any): void;
        on(
          channel: string,
          func: (...args: any[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: any[]) => void): void;
      };
      process: {
        env: NodeJS.Process['env'];
        platform: NodeJS.Process['platform'];
      };
      titleBar: {
        /**
         * Creates a custom titlebar for mac and windows
         */
        create(): any;
      };
      youtube: {
        search(term: string): Promise<ytsr.Result>;
      };
      /**
       * Persists player settings
       */
      settings: {
        /**
         * Get a setting by key
         */
        get: (key: string) => any;
        /**
         * Set a value to a setting by key
         */
        set: (key: string, val: any) => void;
        /**
         * Deletes a key from settings
         */
        delete: (key: string) => void;
        /**
         * Check if setting exists
         */
        has: (key: string) => boolean;
      };
    };
    log: typeof log.functions;
  }
}

export {};
