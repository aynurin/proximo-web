import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import {
  Store,
  connectTo,
  localStorageMiddleware,
  MiddlewarePlacement,
  rehydrateFromLocalStorage
} from "aurelia-store";
import {
  RouterConfiguration, 
  Router, 
  NavigationInstruction, 
  RouterEvent, 
  PipelineResult
} from 'aurelia-router';
import { EventAggregator } from "aurelia-event-aggregator";
import { PLATFORM } from 'aurelia-pal';

import * as environment from '../config/environment.json';

import { State } from './state';
import { TranStateActions } from "model/tran-actions";
import { IntroStateActions } from "model/intro-actions";

import { IntroBuildingContext } from "components/intro-building-context";
import { waitForHtmlElement } from "components/utils";

const COMPONENT_NAME = "app";

const log = LogManager.getLogger(COMPONENT_NAME);

/*
As we progress through dates, we need to:
1. Automatically mark some transactions as executed
2. Generate new future transactions based on defined schedule
3. Adjust totals

On the ledger page we need to:
1. Show latest executed transactions
2. Allow marking executed transactions as not executed
3. Allow marking not executed transactions as executed
4. Delete transactions from the ledger

Current totals can change whenever:
1. Any of the manual changes to the ledger are introduced
2. As the time goes forward
3. When the app loads
*/

@connectTo()
@autoinject()
export class App {
  private router: Router;
  private state: State;
  private rehydrateCompleted: boolean = false;
  private resizeTimer: number;

  get isProduction(): boolean { return environment.debug === false; };

  public constructor(
    private store: Store<State>,
    private tranActions: TranStateActions,
    private introActions: IntroStateActions,
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) { }

  /**
   * Invoked after constructor. At this point in time, the view has also been created and both the view-model and the view are 
   * connected to their controller. The created callback will receive the instance of the "owningView". This is the view that 
   * the component is declared inside of. If the component itself has a view, this will be passed second.
   */
  async created(/*owningView: View, myView: View*/) {
    log.debug("created");
    this.tranActions.register();
    this.introActions.register();
    this.store.registerMiddleware(
      localStorageMiddleware,
      MiddlewarePlacement.After,
      { key: environment.storeKey }
    );
    this.store.registerAction("RehydrateSate", (state: State, key: string) => rehydrateFromLocalStorage(state, key) || false);
    this.ea.subscribe(RouterEvent.Processing, this.navigationProcessing);
    this.ea.subscribe(RouterEvent.Success, this.navigationSuccess);
    await this.store.dispatch("RehydrateSate", environment.storeKey);
    this.rehydrateCompleted = true;
    this.ea.publish("state-hydrated");
    this.stateChanged();
  }

  bind() {
    this.introContext.bind();
  }

  unbind() {
    this.introContext.unbind();
  }

  /**
   * After bind, the component is attached to the DOM (in document). If the view-model has an attached callback, it will be invoked at this time
   */
  attached() {
    log.debug("attached");
    this.resized();
    PLATFORM.global.addEventListener("resize", () => this.resized());
  }

  /**
   * fires when the router processes a new navigation
   */
  navigationProcessing = (event: { instruction: NavigationInstruction; result: PipelineResult }) => {
    log.debug("departing to", event.instruction.config.name);
    this.introContext.clear();
  }

  /**
   * fires when the router finished processing navigation successfully
   */
  navigationSuccess = async (event: { instruction: NavigationInstruction; result: PipelineResult }) => {
    log.debug("landed on", event.instruction.config.name);
    // await this.introContext.startIntroOnce(event.instruction.config.name);
    await this.introContext.startIntro();
  }

  /**
   * If defined on your view-model - is invoked after the component has been removed from the DOM. Due to 
   * navigating away or other reasons.
   */
  detached() {
    PLATFORM.global.removeEventListener("resize", () => this.resized());
  }

  resized() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.ea.publish("screen-changed");
    }, 300);
  }

  async stateChanged() {
    if (this.rehydrateCompleted) {
      let showDashboard = this.state && this.state.schedule && this.state.schedule.length > 0;
      let originalLocationPath = document.location.pathname.trim().substr(1);
      let targetRouteName = showDashboard ? "dashboard" : "welcome";
      let allowRedirect = originalLocationPath === "" 
        || targetRouteName === "welcome" 
        || originalLocationPath === "welcome";

      if (allowRedirect) {
        if (originalLocationPath !== targetRouteName) {
            await this.router.navigateToRoute(targetRouteName);
        } else {
          log.debug("stateChanged: no redirect necessary, showDashboard =", showDashboard, document.location.href);
        }
      }

    }
  }

  async createSchedule(evt) {
    log.debug("createSchedule (ea:schedule-changed)", evt.detail);
    await this.tranActions.addSchedule(evt.detail);
    this.ea.publish('schedule-changed');

    this.showHintsAfterScheduleChanged();
  }

  showHintsAfterScheduleChanged() {
    let intro = this.introContext.getContainer(COMPONENT_NAME);
    waitForHtmlElement("dashboard-tab-button", element => {
      let introPages = this.introContext.getPagesToShow(intro, [
        { element, id: 'transaction-added.dashboard',
          onStepEnter: (introContext: IntroBuildingContext) => {
            log.debug("attaching dashboard-tab-button.click");
            element.addEventListener("click", introContext.completeIntro);
          },
          onStepExit: (introContext: IntroBuildingContext) => {
            log.debug("detaching dashboard-tab-button.click");
            element.removeEventListener("click", introContext.completeIntro);
          } 
        },
      ]);
      this.introContext.startIntroWithPages(introPages);
    });
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    log.debug("configureRouter");
    this.router = router;
    config.title = 'Proximo - A Personal Financial Forecast';
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: '', name: 'default', moduleId: PLATFORM.moduleName('./pages/loading.html'), nav: false, title: 'Loading...' },
      { route: 'dashboard', name: 'dashboard', moduleId: PLATFORM.moduleName('./pages/dashboard'), nav: true, title: 'Dashboard', settings: {mainNav: true} },
      { route: 'schedule', name: 'schedule', moduleId: PLATFORM.moduleName('./pages/schedule'), nav: true, title: 'Schedule', settings: {mainNav: true} },
      { route: 'ledger', name: 'ledger', moduleId: PLATFORM.moduleName('./pages/ledger'), nav: true, title: 'Ledger', settings: {mainNav: true} },
      { route: 'welcome', name: 'welcome', moduleId: PLATFORM.moduleName('./pages/welcome'), nav: false, title: 'Welcome to Proximo!' },
      { route: 'feedback', name: 'feedback', moduleId: PLATFORM.moduleName('./pages/feedback.html'), nav: true, title: 'feedback', settings: {secondaryNav: true} },
      { route: 'about', name: 'about', moduleId: PLATFORM.moduleName('./pages/about.html'), nav: true, title: 'about', settings: {secondaryNav: true} },
    ]);
    config.fallbackRoute('dashboard');
    config.mapUnknownRoutes('dashboard');
  }

  get mainNav() {
    return this.router.navigation.filter(nav => nav.settings.mainNav);
  }

  get secondaryNav() {
    return this.router.navigation.filter(nav => nav.settings.secondaryNav);
  }
}
