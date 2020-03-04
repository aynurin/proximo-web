import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import { PLATFORM } from 'aurelia-pal';
import { autoinject, observable } from "aurelia-framework";
import * as environment from '../config/environment.json';
import { State } from './state';
import { TranStateActions } from "./model/tran-actions";
import { ScheduleWizardCustomElement } from "components/schedule/schedule-wizard";
import { LogManager } from 'aurelia-framework';
import {
  RouterConfiguration, Router,
} from 'aurelia-router';

const log = LogManager.getLogger('app');

@connectTo()
@autoinject()
export class App {
  router: Router;

  get isProduction(): boolean { return environment.debug === false; };

  @observable public state: State;
  public tranBuilder: ScheduleWizardCustomElement;

  public constructor(
    store: Store<State>,
    tranActions: TranStateActions) {
    tranActions.register();
    const storeKey = "tran-schedule-state";
    store.registerMiddleware(
      localStorageMiddleware,
      MiddlewarePlacement.After,
      { key: storeKey }
    );
    store.registerAction("RehydrateSate", (state: State, key: string) => rehydrateFromLocalStorage(state, key) || false);
    store.dispatch("RehydrateSate", storeKey);
  }

  stateChanged() {
    if (this.state != null && this.state.schedule != null && this.state.schedule.length === 0) {
      this.router.navigateToRoute("welcome");
    } else if (this.router.currentInstruction && this.router.currentInstruction.config.name === "welcome") {
      this.router.navigateToRoute("dashboard");
    }
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'Proximo - A Personal Financial Forecast';
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: ['', 'dashboard'], name: 'dashboard', moduleId: PLATFORM.moduleName('./pages/dashboard.html'), nav: true, title: 'Dashboard' },
      { route: 'schedule', name: 'schedule', moduleId: PLATFORM.moduleName('./pages/schedule.html'), nav: true, title: 'Schedule' },
      { route: 'ledger', name: 'ledger', moduleId: PLATFORM.moduleName('./pages/ledger.html'), nav: true, title: 'Ledger' },
      { route: 'welcome', name: 'welcome', moduleId: PLATFORM.moduleName('./pages/welcome.html'), nav: false, title: 'Welcome to Proximo!' },
    ]);
    config.fallbackRoute('dashboard');
    config.mapUnknownRoutes('dashboard');
  }
}
