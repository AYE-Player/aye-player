import axios from "axios";
import { flow, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";

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
    name: types.maybe(types.string),
    avatar: types.maybe(types.string)
  })
  .actions(self => ({
    afterCreate: flow(function*() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // @ts-ignore
          const { data: userInfo } = yield axios.get(
            "https://api.aye-player.de/v1/userIdentity/",
            {
              headers: {
                "x-access-token": token
              }
            }
          );
          self.id = userInfo.Id;
          self.email = userInfo.Email;
          self.name = userInfo.Username;
          self.avatar = userInfo.Avatar ? userInfo.Avatar : undefined;
          self.isAnonym = false;
          self.isAuthenticated = true;
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
        const { data: token } = yield axios.post(
          "https://api.aye-player.de/v1/auth/",
          {
            Email: username,
            Password: password
          }
        );
        //@ts-ignore
        const { data: userInfo } = yield axios.get(
          "https://api.aye-player.de/v1/userIdentity/",
          {
            headers: {
              "x-access-token": token
            }
          }
        );
        localStorage.setItem("token", token);

        // Save user information
        self.id = userInfo.Id;
        self.email = userInfo.Email;
        self.name = userInfo.Username;
        self.avatar = userInfo.Avatar ? userInfo.Avatar : undefined;
        self.isAnonym = false;
        self.isAuthenticated = true;
        // TODO: Really set this
        self.hasPremium = true;
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
        yield axios.delete(`https://api.aye-player.de/v1/userIdentity/`, {
          headers: {
            "x-access-token": localStorage.getItem("token")
          }
        });
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
        yield axios.patch(
          "https://api.aye-player.de/v1/userIdentity/",
          [{ op: "replace", path: "/Password", value: password }],
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );
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
        // INFO: We have to use fetch here, because axios has problems with formData uploads/requests...
        const res = yield fetch(
          "https://api.aye-player.de/v1/userIdentity/avatar",
          {
            method: "POST",
            body: data,
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );

        // parse response (gives storage URL)
        const avatarURL = yield res.json();

        // Patch userprofile with new URL
        yield axios.patch(
          `https://api.aye-player.de/v1/userIdentity/`,
          [{ op: "replace", path: "/Avatar", value: avatarURL }],
          {
            headers: {
              "x-access-token": localStorage.getItem("token")
            }
          }
        );

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
        yield axios.post("https://api.aye-player.de/v1/userIdentity/", {
          Email: email,
          Password: password
        });
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
        yield axios.put(`https://api.aye-player.de/v1/userIdentity/password`, {
          Email: email
        });
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
