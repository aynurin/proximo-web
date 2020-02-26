import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import * as State from "./state";
import { TranStateActions } from "./model/tran-actions";
import { TranGenerated } from "model/tran-generated";
import { EventAggregator } from "aurelia-event-aggregator";
import { ScheduleWizardCustomElement } from "schedule/schedule-wizard";
import { TranChartCustomElement } from "tran-chart";
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('app');

@connectTo()
export class App {
  message = "FinForecast";
  myTabs = [
    { id: 'tab1', label: 'Dashboard', tooltip: 'Your forecast summary', active: true },
    { id: 'tab2', label: 'Schedule', tooltip: 'Schedule of the transactions' },
    { id: 'tab3', label: 'Ledger', tooltip: 'Your ledger generated based on the schedule' }
  ];
  tranChartViewModel: TranChartCustomElement;

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

  created() {
    this.ea.subscribe("ledgerGenerated", (ledger: TranGenerated[]) => {
      log.debug('Receiving new ledger');
      this.tranChartViewModel.ledgerChanged(ledger);
    });
  }
}
