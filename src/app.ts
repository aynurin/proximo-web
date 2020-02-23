import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import {observable, bindable} from "aurelia-framework";
import * as State from "./state";
import { TranStateActions } from "./model/tran-actions";
import { TranGenerated } from "model/tran-generated";

@connectTo()
export class App {
  message = "FinForecast";
  myTabs = [
    { id: 'tab1', label: 'Dashboard', tooltip: 'Your forecast summary' },
    { id: 'tab2', label: 'Schedule', tooltip: 'Schedule of the transactions' },
    { id: 'tab3', label: 'Ledger', tooltip: 'Your ledger generated based on the schedule' }
  ];

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
