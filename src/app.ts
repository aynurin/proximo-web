import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import { EventAggregator } from "aurelia-event-aggregator";
import { PLATFORM } from 'aurelia-pal';
import { autoinject } from "aurelia-framework";
import * as environment from '../config/environment.json';
import { State } from './state';
import { TranStateActions } from "./model/tran-actions";
import { ScheduleWizardCustomElement } from "components/schedule/schedule-wizard";
import { LogManager } from 'aurelia-framework';
import {
  RouterConfiguration, Router, NavigationInstruction
} from 'aurelia-router';

const log = LogManager.getLogger('app');

@connectTo()
@autoinject()
export class App {
  router: Router;
  disableTabs: boolean = true;
  showWelcome: boolean = true;

  public state: State;
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
    if (this.state == null || this.state.schedule == null) {
      return;
    }
    if (this.state.schedule.length === 0) {
      this.setShowWelcome(true);
    } else {
      this.setShowWelcome(false);
    }
    log.debug('stateChanged', this.disableTabs, this.state, 
      (this.state && this.state.schedule ? this.state.schedule.length : "null"));
  }

  setShowWelcome(showWelcome: boolean) {
    if (this.router.currentInstruction) {
      if (showWelcome) {
        if (this.router.currentInstruction.config.name !== "welcome") {
          this.router.navigateToRoute("welcome");
        }
      } else if (this.router.currentInstruction.config.name === "welcome") {
        this.router.navigateToRoute("dashboard");
      }
    }
    this.showWelcome = showWelcome;
    this.disableTabs = showWelcome;
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.title = 'Proximo - A Personal Financial Forecast';
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: '', name: 'default', navigationStrategy: this.defaultNavigation },
      { route: 'dashboard', name: 'dashboard', moduleId: PLATFORM.moduleName('./pages/dashboard.html'), nav: true, title: 'Dashboard', settings: {mainNav: true} },
      { route: 'schedule', name: 'schedule', moduleId: PLATFORM.moduleName('./pages/schedule.html'), nav: true, title: 'Schedule', settings: {mainNav: true} },
      { route: 'ledger', name: 'ledger', moduleId: PLATFORM.moduleName('./pages/ledger.html'), nav: true, title: 'Ledger', settings: {mainNav: true} },
      { route: 'welcome', name: 'welcome', moduleId: PLATFORM.moduleName('./pages/welcome'), nav: false, title: 'Welcome to Proximo!' },
      { route: 'feedback', name: 'feedback', moduleId: PLATFORM.moduleName('./pages/feedback.html'), nav: true, title: 'feedback', settings: {secondaryNav: true} },
      { route: 'about', name: 'about', moduleId: PLATFORM.moduleName('./pages/about.html'), nav: true, title: 'about', settings: {secondaryNav: true} },
    ]);
    config.fallbackRoute('dashboard');
    config.mapUnknownRoutes('dashboard');
  }

  defaultNavigation = (instruction: NavigationInstruction) => {
    if (this.showWelcome === true) {
      instruction.config.redirect = 'welcome';
    } else {
      instruction.config.redirect = 'dashboard';
    }
  };

  get mainNav() {
    return this.router.navigation.filter(nav => nav.settings.mainNav);
  }

  get secondaryNav() {
    return this.router.navigation.filter(nav => nav.settings.secondaryNav);
  }
}
