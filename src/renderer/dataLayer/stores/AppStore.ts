import { model, Model, modelAction, prop } from 'mobx-keystone';
import { Channel } from '../../../types/enums';

@model('AppStore')
class AppStore extends Model({
  showQueue: prop<boolean>(),
  rpcEnabled: prop<boolean>(),
  devMode: prop(false),
  minimizeToTray: prop<boolean>(),
  language: prop<string>(),
  selectedPlaylist: prop<string>(),
  autoRadio: prop(false),
  showNotifications: prop(true),
  listenMoeLoggedIn: prop(false),
}) {
  onInit() {
    this.listenMoeLoggedIn = !!localStorage.getItem('listenMoe_token');
  }

  @modelAction
  toggleQueueDisplay() {
    this.showQueue = !this.showQueue;
  }

  @modelAction
  toggleRPC() {
    this.rpcEnabled = !this.rpcEnabled;
    if (this.rpcEnabled) {
      window.electron.ipcRenderer.sendMessage(Channel.ENABLE_RPC);
      window.electron.settings.set('rpcEnabled', true);
    } else {
      window.electron.ipcRenderer.sendMessage(Channel.DISABLE_RPC);
      window.electron.settings.set('rpcEnabled', false);
    }
  }

  @modelAction
  toggleMinimizeToTray() {
    this.minimizeToTray = !this.minimizeToTray;
    window.electron.settings.set('minimizeToTray', this.minimizeToTray);
  }

  @modelAction
  toggleDevMode() {
    this.devMode = !this.devMode;
    window.electron.settings.set('devMode', this.devMode);
  }

  @modelAction
  setLanguage(lang: string) {
    this.language = lang;
    window.electron.settings.set('language', lang);

    window.electron.ipcRenderer.sendMessage(Channel.CHANGE_LANGUAGE, {
      lang,
    });
  }

  @modelAction
  setActivePlaylist(id: string) {
    this.selectedPlaylist = id;
  }

  @modelAction
  toggleAutoRadio() {
    this.autoRadio = !this.autoRadio;
    window.electron.settings.set('autoRadio', this.autoRadio);
  }

  @modelAction
  toggleShowNotifications() {
    this.showNotifications = !this.showNotifications;
    window.electron.settings.set('showNotifications', this.showNotifications);
  }

  @modelAction
  setListenMoeLogin(value: boolean) {
    this.listenMoeLoggedIn = value;
  }
}

export default AppStore;
