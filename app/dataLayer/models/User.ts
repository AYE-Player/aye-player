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
          const { data: userInfo } = yield axios.get(
            "https://api.aye-player.de/userIdentity/v1/",
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
          // Doesnt matter
        }
      }
    }),
    authenticate: flow(function*(username: string, password: string) {
      try {
        AyeLogger.player(`Trying to log in with: ${username}`);
        const { data: token } = yield axios.post(
          "https://api.aye-player.de/auth/v1/",
          {
            Email: username,
            Password: password
          }
        );
        const { data: userInfo } = yield axios.get(
          "https://api.aye-player.de/userIdentity/v1/",
          {
            headers: {
              "x-access-token": token
            }
          }
        );
        localStorage.setItem("token", token);

        // Authenticate user
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

    delete() {
      AyeLogger.player("DELETING USER");
    },

    updatePassword: flow(function*(password: string) {
      try {
        AyeLogger.player(`Trying to set new password for ${self.id}`);
        yield axios.post(
          "https://api.aye-player.de/userIdentity/v1/",
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
          "https://api.aye-player.de/userIdentity/v1/avatar",
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
          `https://api.aye-player.de/userIdentity/v1/${self.id}`,
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
        yield axios.post("https://api.aye-player.de/userIdentity/v1/", {
          Email: email,
          Password: password
        });
        AyeLogger.player(`REGISTER EVENT ${name} ${email}`);
      } catch (error) {
        AyeLogger.player(`Failed registration ${error}`, LogType.ERROR);
        throw error;
      }
    }),

    forgotPassword: flow(function*(email: string) {
      try {
        /*const res = yield axios.post(
        `https://api.aye-player.de/forgotPassword/${email}`,
          timeout: 30000
        }
      );*/
        AyeLogger.player(`FORGOT PASSWORD EVENT ${email}`);
      } catch (error) {
        AyeLogger.player(`Failed to reset password ${error}`, LogType.ERROR);
        throw error;
      }
    })
  }));

export default User;
