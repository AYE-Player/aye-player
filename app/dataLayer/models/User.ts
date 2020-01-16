import {
  model,
  Model,
  prop,
  _async,
  _await,
  modelFlow,
  modelAction
} from "mobx-keystone";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import ApiClient from "../api/ApiClient";

interface IRole {
  Name: string;
  Id: string;
}

@model("User")
export default class User extends Model({
  id: prop<string>(),
  email: prop<string>(),
  roles: prop<string[]>(() => []),
  name: prop<string>(),
  avatar: prop<string>(),
  isAuthenticated: prop(false),
  hasPremium: prop(false)
}) {
  getRefId() {
    return this.id;
  }

  @modelFlow
  onInit = _async(function*(this: User) {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userInfo = yield* _await(
          ApiClient.getUserdata()
        );
        this.id = userInfo.Id;
        this.email = userInfo.Email;
        this.name = userInfo.Username;
        this.avatar = userInfo.Avatar ? userInfo.Avatar : undefined;
        this.isAuthenticated = true;
        this.roles = userInfo.Roles.map((role: IRole) => role.Name);
        this.hasPremium =
          !!userInfo.Roles.find((role: IRole) => role.Name === "admin") ||
          !!userInfo.Roles.find((role: IRole) => role.Name === "premium");
      } catch (error) {
        localStorage.removeItem("token");
        console.error(error);
      }
    }
  });

  @modelFlow
  authenticate = _async(function*(
    this: User,
    username: string,
    password: string
  ) {
    try {
      AyeLogger.player(`Trying to log in with: ${username}`);
      const token = yield* _await(
        ApiClient.authenticate(username, password)
      );

      localStorage.setItem("token", token);

      const userInfo = yield* _await(
        ApiClient.getUserdata()
      );

      // Save user information
      this.id = userInfo.Id;
      this.email = userInfo.Email;
      this.name = userInfo.Username;
      this.avatar = userInfo.Avatar ? userInfo.Avatar : undefined;
      this.isAuthenticated = true;
      this.roles = userInfo.Roles.map((role: IRole) => role.Name);
      this.hasPremium =
        !!userInfo.Roles.find((role: IRole) => role.Name === "admin") ||
        !!userInfo.Roles.find((role: IRole) => role.Name === "premium");
      AyeLogger.player(`Logged in user ${username}`);
    } catch (error) {
      AyeLogger.player(`Error logging in ${error}`, LogType.ERROR);
      throw error;
    }
  });

  @modelAction
  logout() {
    localStorage.removeItem("token");
    this.id = undefined;
    this.email = undefined;
    this.name = undefined;
    this.avatar = undefined;
    this.isAuthenticated = false;
    this.hasPremium = false;
  }

  @modelFlow
  delete = _async(function*(this: User) {
    try {
      AyeLogger.player(`Deleting User ${this.id}`);
      yield* _await(ApiClient.deleteUser());
      this.logout();
      AyeLogger.player(`Deleted`);
    } catch (error) {
      AyeLogger.player(
        `Error deleting user ${this.id}, ERROR: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    }
  });

  @modelFlow
  updatePassword = _async(function*(this: User, password: string) {
    try {
      AyeLogger.player(`Trying to set new password for ${this.id}`);
      yield* _await(ApiClient.updatePassword(password));
      AyeLogger.player(`New Password set.`);
    } catch (error) {
      AyeLogger.player(
        `Error Setting new password for user ${this.id} ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
      throw error;
    }
  });

  @modelFlow
  updateAvatar = _async(function*(this: User, avatar: File) {
    try {
      const data = new FormData();
      data.append("avatar", avatar);

      // Upload avatar image and get storage URL
      const avatarURL = yield* _await(ApiClient.updateAvatar(data));

      // Patch userprofile with new URL
      yield* _await(ApiClient.updateAvatarUrl(avatarURL));

      // set local URL for direct effect
      this.avatar = avatarURL;
      AyeLogger.player(`Updated User Avatar ${avatarURL}`);
    } catch (error) {
      AyeLogger.player(`Error Updating user avatar ${error}`, LogType.ERROR);
      throw error;
    }
  });

  @modelFlow
  register = _async(function*(
    this: User,
    name: string,
    email: string,
    password: string
  ) {
    try {
      AyeLogger.player(`Trying to register with ${name} ${email}`);
      yield* _await(ApiClient.register(name, email, password));
    } catch (error) {
      AyeLogger.player(
        `Failed registration ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      throw error;
    }
  });

  @modelFlow
  forgotPassword = _async(function*(this: User, email: string) {
    try {
      AyeLogger.player(`Trying to reset password for ${email}`);
      yield* _await(ApiClient.forgotPassword(email));
    } catch (error) {
      AyeLogger.player(
        `Failed to start password reset process ${JSON.stringify(
          error,
          null,
          2
        )}`,
        LogType.ERROR
      );
      throw error;
    }
  });
}
