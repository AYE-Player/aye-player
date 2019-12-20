import { flow, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import ApiClient from "../api/ApiClient";

export type UserModel = typeof User.Type;

interface IRole {
  Name: string;
  Id: string;
}

const User = types
  .model({
    isAuthenticated: types.optional(types.boolean, false),
    hasPremium: types.optional(types.boolean, false),
    isAnonym: types.optional(types.boolean, true),
    id: types.maybe(types.string),
    email: types.maybe(types.string),
    roles: types.optional(types.array(types.string), []),
    name: types.maybe(types.string),
    avatar: types.maybe(types.string)
  })
  .actions(self => ({
    afterCreate: flow(function*() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // @ts-ignore
          const { data: userInfo } = yield ApiClient.getUserdata();
          self.id = userInfo.Id;
          self.email = userInfo.Email;
          self.name = userInfo.Username;
          self.avatar = userInfo.Avatar ? userInfo.Avatar : undefined;
          self.isAnonym = false;
          self.isAuthenticated = true;
          self.roles = userInfo.Roles.map((role: IRole) => role.Name);
          self.hasPremium =
            !!userInfo.Roles.find((role: IRole) => role.Name === "admin") ||
            !!userInfo.Roles.find((role: IRole) => role.Name === "premium");
        } catch (error) {
          localStorage.removeItem("token");
          console.error(error);
        }
      }
    }),
    authenticate: flow(function*(username: string, password: string) {
      try {
        AyeLogger.player(`Trying to log in with: ${username}`);
        //@ts-ignore
        const { data: token } = yield ApiClient.authenticate(
          username,
          password
        );

        localStorage.setItem("token", token);
        
        //@ts-ignore
        const { data: userInfo } = yield ApiClient.getUserdata();

        // Save user information
        self.id = userInfo.Id;
        self.email = userInfo.Email;
        self.name = userInfo.Username;
        self.avatar = userInfo.Avatar ? userInfo.Avatar : undefined;
        self.isAnonym = false;
        self.isAuthenticated = true;
        self.roles = userInfo.Roles.map((role: IRole) => role.Name);
        self.hasPremium =
          !!userInfo.Roles.find((role: IRole) => role.Name === "admin") ||
          !!userInfo.Roles.find((role: IRole) => role.Name === "premium");
        AyeLogger.player(`Logged in user ${username}`);
      } catch (error) {
        AyeLogger.player(`Error logging in ${error}`, LogType.ERROR);
        throw error;
      }
    }),

    logout() {
      localStorage.removeItem("token");
      self.id = undefined;
      self.email = undefined;
      self.name = undefined;
      self.avatar = undefined;
      self.isAnonym = true;
      self.isAuthenticated = false;
      self.hasPremium = false;
    },

    delete: flow(function*() {
      try {
        AyeLogger.player(`Deleting User ${self.id}`);
        yield ApiClient.deleteUser();
        AyeLogger.player(`Deleted`);
      } catch (error) {
        AyeLogger.player(
          `Error deleting user ${self.id}, ERROR: ${JSON.stringify(
            error,
            null,
            2
          )}`
        );
      }
    }),

    updatePassword: flow(function*(password: string) {
      try {
        AyeLogger.player(`Trying to set new password for ${self.id}`);
        yield ApiClient.updatePassword(password);
        AyeLogger.player(`New Password set.`);
      } catch (error) {
        AyeLogger.player(
          `Error Setting new password ${JSON.stringify(error, null, 2)}`
        );
        throw error;
      }
    }),

    updateAvatar: flow(function*(avatar: File) {
      try {
        const data = new FormData();
        data.append("avatar", avatar);

        // Upload avatar image
        const res = yield ApiClient.updateAvatar(data);

        // parse response (gives storage URL)
        const avatarURL = yield res.json();

        // Patch userprofile with new URL
        yield ApiClient.updateAvatarUrl(avatarURL);

        // set local URL for direct effect
        self.avatar = avatarURL;
        AyeLogger.player(`Updated User Avatar ${avatarURL}`);
      } catch (error) {
        AyeLogger.player(`Error Updating user avatar ${error}`, LogType.ERROR);
        throw error;
      }
    }),

    register: flow(function*(name: string, email: string, password: string) {
      try {
        AyeLogger.player(`Trying to register with ${name} ${email}`);
        yield ApiClient.register(email, password);
      } catch (error) {
        AyeLogger.player(
          `Failed registration ${JSON.stringify(error, null, 2)}`,
          LogType.ERROR
        );
        throw error;
      }
    }),

    forgotPassword: flow(function*(email: string) {
      try {
        AyeLogger.player(`Trying to reset password for ${email}`);
        yield ApiClient.forgotPassword(email);
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
    })
  }));

export default User;
