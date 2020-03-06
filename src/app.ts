import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import { EventAggregator } from "aurelia-event-aggregator";
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
  disableTabs: boolean = true;

  @observable public state: State;
  public tranBuilder: ScheduleWizardCustomElement;

  resizeTimer = null;

  get isProduction(): boolean { return environment.debug === false; };

  public constructor(
    store: Store<State>,
    tranActions: TranStateActions,
    private ea: EventAggregator) {
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

  attached() {
    this.resized();

    PLATFORM.global.addEventListener("resize", () => this.resized());
  }

  detached() {
    PLATFORM.global.removeEventListener("resize", () => this.resized());
  }

  resized() {
    clearTimeout(this.resizeTimer);

    this.resizeTimer = setTimeout(() => {
      this.ea.publish("screen-changed");
    }, 300);
  }

  stateChanged() {
    if (this.state != null && this.state.schedule != null && this.state.schedule.length === 0) {
      this.router.navigateToRoute("welcome");
      this.disableTabs = true;
    } else {
      this.disableTabs = false;
      if (this.router.currentInstruction && this.router.currentInstruction.config.name === "welcome") {
        this.router.navigateToRoute("dashboard");
      }
    }
    log.debug('stateChanged', this.disableTabs, this.state, 
      (this.state && this.state.schedule ? this.state.schedule.length : "null"));
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
      { route: 'welcome', name: 'welcome', moduleId: PLATFORM.moduleName('./pages/welcome'), nav: false, title: 'Welcome to Proximo!' },
    ]);
    config.fallbackRoute('dashboard');
    config.mapUnknownRoutes('dashboard');
  }
}
