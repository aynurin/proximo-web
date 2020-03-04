import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import { autoinject } from "aurelia-framework";
import * as environment from '../config/environment.json';
import * as State from "./state";
import { TranStateActions } from "./model/tran-actions";
import { ScheduleWizardCustomElement } from "components/schedule/schedule-wizard";
import { GenerateLedger } from "./generate-ledger";
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('app');

@connectTo()
@autoinject()
export class App {
  message = "FinForecast";
  myTabs = [
    { id: 'tab1', label: 'Dashboard', tooltip: 'Your forecast summary', active: true },
    { id: 'tab2', label: 'Schedule', tooltip: 'Schedule of the transactions' },
    { id: 'tab3', label: 'Ledger', tooltip: 'Your ledger generated based on the schedule' }
  ];
  generateLedger: GenerateLedger;

  get isProduction(): boolean { return environment.debug === false; };

  public state: State.State;
  public tranBuilder: ScheduleWizardCustomElement;

  public constructor(
    store: Store<State.State>,
    tranActions: TranStateActions) {
    tranActions.register();
    store.registerMiddleware(
      localStorageMiddleware,
      MiddlewarePlacement.After,
      { key: "tran-schedule-state" }
    );
    store.registerAction("RehydrateSate", (state: State.State, key: string) => {
      log.debug("restore state");
      const newState = rehydrateFromLocalStorage(state, key);
      if (!newState) {
        return false;
      } else {
        return newState;
      }
    });
    store.dispatch("RehydrateSate", "tran-schedule-state");
  }
}
