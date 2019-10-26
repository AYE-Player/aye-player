import { types, Instance } from "mobx-state-tree";

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
    authenticate(username: string, password: string) {
      // TODO: This function should be called without parameters, these should come directly from the api response
      self.id = "USER_1";
      self.email = "majesnix@majesnix.org";
      self.name = "majesnix";
      self.avatar = "https://i.dcl.re/6zagS1oT6cRBXOBMJS8NLoL9PKQd1zJj.webp";
      self.isAnonym = false;
      self.isAuthenticated = true;
      self.hasPremium = true;
    },

    logout() {
      self.id = undefined;
      self.email = undefined;
      self.name = undefined;
      self.avatar = undefined;
      self.isAnonym = true;
      self.isAuthenticated = false;
      self.hasPremium = false;
    },

    updatePassword(password: string) {
      console.log("NEW PASSWORD", password);
    },

    register(name: string, email: string, password: string) {
      console.log("REGISTER EVENT", name, email, password);
    },

    forgotPassword(email: string) {
      console.log("FORGOT PASSWORD EVENT", email);
    }
  }));

export default User;
