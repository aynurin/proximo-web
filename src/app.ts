import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import * as State from "./state";
import { TranStateActions } from "./model/tran-actions";
import { EventAggregator } from "aurelia-event-aggregator";
import { ScheduleWizardCustomElement } from "components/schedule/schedule-wizard";

@connectTo()
export class App {
  message = "FinForecast";
  myTabs = [
    { id: 'tab1', label: 'Dashboard', tooltip: 'Your forecast summary', active: true },
    { id: 'tab2', label: 'Schedule', tooltip: 'Schedule of the transactions' },
    { id: 'tab3', label: 'Ledger', tooltip: 'Your ledger generated based on the schedule' }
  ];

  public state: State.State;
  public tranBuilder: ScheduleWizardCustomElement;

  public constructor(
    private store: Store<State.State>,
    private ea: EventAggregator) {
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
