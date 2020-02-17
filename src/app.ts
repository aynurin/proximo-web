import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import * as State from "./state";
import { TranStateActions } from "./model/tran-actions";

@connectTo()
export class App {
  message = "FinForecast";
  accounts: string[] = [];

  public state: State.State;

  public constructor(private store: Store<State.State>) {
    let tranActions = new TranStateActions(this.store);
    tranActions.register();
    store.registerMiddleware(
      localStorageMiddleware,
      MiddlewarePlacement.After,
      { key: "tran-schedule-state" }
    );
    store.registerAction("Rehydrate", rehydrateFromLocalStorage);
    store.dispatch(rehydrateFromLocalStorage, "tran-schedule-state");
  }
}
