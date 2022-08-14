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

interface IRole {
  Name: string;
  Id: string;
}

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
    this.id = userInfo.Id;
    this.email = userInfo.Email;
    this.name = userInfo.Username;
    this.avatar = userInfo.Avatar ?? undefined;
    this.isAuthenticated = true;
    this.roles = userInfo.Roles.map((role: IRole) => role.Name);
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
    this.id = userInfo.Id;
    this.email = userInfo.Email;
    this.name = userInfo.Username;
    this.avatar = userInfo.Avatar ?? undefined;
    this.isAuthenticated = true;
    this.roles = userInfo.Roles.map((role: IRole) => role.Name);
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
  updatePassword = _async(function* (this: User, password: string) {
    yield* _await(ApiClient.updatePassword(password));
  });

  @modelFlow
  updateAvatar = _async(function* (this: User, avatar: File) {
    const data = new FormData();
    data.append('avatar', avatar);

    // Upload avatar image and get storage URL
    const avatarURL = yield* _await(ApiClient.updateAvatar(data));

    // Patch userprofile with new URL
    yield* _await(ApiClient.updateAvatarUrl(avatarURL));

    // set local URL for direct effect
    this.avatar = avatarURL;
  });

  @modelFlow
  register = _async(function* (
    this: User,
    name: string,
    email: string,
    password: string
  ) {
    yield* _await(ApiClient.register(name, email, password));
  });

  @modelFlow
  forgotPassword = _async(function* (this: User, email: string) {
    yield* _await(ApiClient.forgotPassword(email));
  });
}

export default User;
