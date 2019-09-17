import { observable, action, runInAction } from "mobx";

class Store {
  counter = new CounterStore();
  uiStore = new UIStore();

  /*constructor() {
    this.uiStore = new UIStore();
    this.counter = new Counter();
  } */
}

export class UIStore {
  @observable TextColor = "yellow";

  @action.bound
  changeTextColor() {
    this.TextColor = this.TextColor === "yellow" ? "red" : "yellow";
  }
}

export class CounterStore {
  @observable count = 1;

  @action.bound
  increment() {
    this.count++;
  }

  @action.bound
  decrement() {
    this.count--;
  }

  @action.bound
  incrementIfOdd() {
    if (this.count % 2 === 0) {
      this.count++;
    }
  }

  @action.bound
  incrementAsync() {
    setTimeout(() => {
      runInAction("async add count", () => {
        this.count++;
      });
    }, 1000);
  }
}

const store = new Store();

export default store;
