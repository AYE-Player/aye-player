import { types, Instance, flow } from "mobx-state-tree";
import axios from "axios";
import Logger from "../../modules/AyeLogger";

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
      if (localStorage.getItem("token")) {
        try {
          self.id = "USER_1";
          self.email = "majesnix@majesnix.org";
          self.name = "majesnix";
          self.avatar =
            "https://i.dcl.re/6zagS1oT6cRBXOBMJS8NLoL9PKQd1zJj.webp";
          self.isAnonym = false;
          self.isAuthenticated = true;
          self.hasPremium = true;
        } catch (error) {
          self.id = undefined;
          self.email = undefined;
          self.name = undefined;
          self.avatar = undefined;
          self.isAnonym = true;
          self.isAuthenticated = false;
          self.hasPremium = false;
        }
      }
    }),
    authenticate: flow(function* authenticate(
      username: string,
      password: string
    ) {
      try {
        Logger.player(`Trying to log in with: ${username}, ${password}`);
        const { data: token } = yield axios.post(
          "https://api.aye-player.de/auth/v1/",
          {
            Email: username,
            Password: password
          }
        );
        localStorage.setItem("token", token);
        // Authenticate user
        self.id = "USER_1";
        self.email = "majesnix@majesnix.org";
        self.name = "majesnix";
        self.avatar = "https://i.dcl.re/6zagS1oT6cRBXOBMJS8NLoL9PKQd1zJj.webp";
        self.isAnonym = false;
        self.isAuthenticated = true;
        self.hasPremium = true;
        Logger.player(`Logged in user ${username}`);
      } catch (error) {
        Logger.player(`Error logging in ${error}`, "error");
      }
    }),

    logout() {
      Logger.player("LOGGING UT");
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
      Logger.player("DELETING USER");
    },

    updatePassword(password: string) {
      Logger.player(`NEW PASSWORD ${password}`);
    },

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
        Logger.player(`RES ${response}`);
        Logger.player(`REGISTER EVENT ${name} ${email} ${password}`);
      } catch (error) {
        Logger.player(`Failed registration ${error}`, "error");
        throw error;
      }
    }),

    forgotPassword(email: string) {
      Logger.player(`FORGOT PASSWORD EVENT ${email}`);
    }
  }));

export default User;
