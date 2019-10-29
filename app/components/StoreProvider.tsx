import { createContext, useContext } from "react";
import { RootStoreModel } from "../dataLayer/stores/RootStore";

const StoreContext = createContext<RootStoreModel>({} as RootStoreModel);

export const useStore = () => useContext(StoreContext);
export const StoreProvider = StoreContext.Provider;
