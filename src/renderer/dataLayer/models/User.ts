import {
  model,
  Model,
  modelAction,
  modelFlow,
  prop,
  _async,
  _await,
} from 'mobx-keystone';
import { Channel } from '../../../types/enums';
import { IUserInfoDto } from '../../../types/response';
import ApiClient from '../api/ApiClient';

@model('User')
class User extends Model({
  id: prop<string | undefined>(),
  email: prop<string | undefined>(),
  roles: prop<string[]>(() => []),
  name: prop<string | undefined>(),
  avatar: prop<string | undefined>(),
  isAuthenticated: prop(false),
}) {
  getRefId() {
    return this.id!;
  }

  @modelAction
  setData(userInfo: IUserInfoDto) {
    this.email = userInfo.email;
    this.name = userInfo.username;
    this.avatar =
      `https://cdn.aye-playr.de/public/avatars/${userInfo.avatar}` ?? undefined;
    this.isAuthenticated = true;
    this.roles = userInfo.roles.map((role) => role.name);
  }

  @modelFlow
  authenticate = _async(function* (
    this: User,
    username: string,
    password: string
  ) {
    window.electron.ipcRenderer.sendMessage(Channel.LOG, {
      message: `Trying to log in with: ${username}`,
    });
    const token = yield* _await(ApiClient.authenticate(username, password));

    localStorage.setItem('token', token);

    const userInfo = yield* _await(ApiClient.getUserdata());

    // Save user information
    this.email = userInfo.email;
    this.name = userInfo.username;
    this.avatar =
      `https://cdn.aye-playr.de/public/avatars/${userInfo.avatar}` ?? undefined;
    this.isAuthenticated = true;
    this.roles = userInfo.roles.map((role) => role.name);
  });

  @modelAction
  logout() {
    localStorage.removeItem('token');
    this.id = undefined;
    this.email = undefined;
    this.name = undefined;
    this.avatar = undefined;
    this.isAuthenticated = false;
  }

  @modelFlow
  delete = _async(function* (this: User) {
    window.electron.ipcRenderer.sendMessage(Channel.LOG, {
      message: `Deleting User ${this.id}`,
    });
    yield* _await(ApiClient.deleteUser());
    this.logout();
  });

  @modelFlow
  updatePassword = _async(function* (
    this: User,
    newPassword: string,
    oldPassword: string
  ) {
    yield* _await(ApiClient.updatePassword(oldPassword, newPassword));
  });

  @modelFlow
  updateAvatar = _async(function* (this: User, newAvatar: File) {
    const data = new FormData();
    data.append('avatar', newAvatar);

    // Upload avatar image and get storage URL
    const { avatar } = yield* _await(ApiClient.updateAvatar(data));

    // set local URL for direct effect
    this.avatar = `https://cdn.aye-playr.de/public/avatars/${avatar}`;
  });

  @modelFlow
  register = _async(function* (
    this: User,
    name: string,
    email: string,
    password: string,
    inviteCode?: string
  ) {
    return yield* _await(ApiClient.register(name, email, password, inviteCode));
  });

  @modelFlow
  forgotPassword = _async(function* (this: User, email: string) {
    yield* _await(ApiClient.forgotPassword(email));
  });
}

export default User;
