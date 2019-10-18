import { types, Instance } from "mobx-state-tree";

export type UserModel = Instance<typeof User>;

const User = types.model({
  isAuthenticated: types.optional(types.boolean, false),
  isAdmin: types.optional(types.boolean, false),
  id: types.string,
  email: types.string,
  name: types.string
});

export default User;
