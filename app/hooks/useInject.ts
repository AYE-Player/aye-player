import { useStore } from "../components/StoreProvider";
import RootStore from "../dataLayer/stores/RootStore";

export type MapStore<T> = (store: RootStore) => T;

const useInject = <T>(mapStore: MapStore<T>) => {
  const store = useStore();
  return mapStore(store);
};

export default useInject;
