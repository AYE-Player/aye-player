import axios from "axios";
import { flow, Instance, types } from "mobx-state-tree";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";

export type UserModel = Instance<typeof User>;

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
    afterCreate: flow(function* afterCreate() {
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
          self.avatar = userInfo.Avatar;
          self.isAnonym = false;
          self.isAuthenticated = true;
          self.hasPremium = true;
        } catch (error) {
          // Doesnt matter
        }
      }
    }),
    authenticate: flow(function* authenticate(
      username: string,
      password: string
    ) {
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
        self.avatar = userInfo.Avatar;
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

    updatePassword: flow(function* updatePassword(password: string) {
      AyeLogger.player(`NEW PASSWORD ${password}`);
    }),

    updateAvatar: flow(function* updateAvatar(avatar: any) {
      AyeLogger.player(`UPDATE USER ${avatar}`);
    }),

    register: flow(function* register(
      name: string,
      email: string,
      password: string
    ) {
      try {
        const response = yield axios.post(
          "https://api.aye-player.de/userIdentity/v1/",
          { Email: email, Password: password }
        ); // yield for promise resolving
        AyeLogger.player(`RES ${response}`);
        AyeLogger.player(`REGISTER EVENT ${name} ${email} ${password}`);
      } catch (error) {
        AyeLogger.player(`Failed registration ${error}`, LogType.ERROR);
        throw error;
      }
    }),

    forgotPassword(email: string) {
      AyeLogger.player(`FORGOT PASSWORD EVENT ${email}`);
    }
  }));

export default User;
