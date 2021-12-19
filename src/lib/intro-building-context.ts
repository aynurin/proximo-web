import { IIntroState } from 'lib/model/IntroState';
import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { Store } from "aurelia-store";

import introJs, { Hint, Options, Step } from "intro.js";
import { Subscription } from "rxjs";

import { IPerson } from "lib/model/Person";
import StateMutationFactory from './state/StateMutationFactory';

import 'intro.js/introjs.css';
// import 'intro.js/themes/introjs-nazanin.css';

const log = LogManager.getLogger('intro-building-context');

/**
 * This class should be a singleton and contains all intro related building blocks and 
 * logic for the app
 */
@autoinject()
export class IntroBuildingContext {
  private introContainersState: IIntroState[];
  private subscription: Subscription;
  private containers: { [stepId: string]: IntroContainer } = {};
  private currentIntro: introJs.IntroJs = null;
  private introIsRunning = false;
  private introStartHandle = 0;

  constructor(
    public store: Store<IPerson>,
    private i18n: I18N,
    private stateMutation: StateMutationFactory) { }

  public bind() {
    this.subscription = this.store.state.subscribe(
      (state) => {
        this.introContainersState = state.introSteps ? state.introSteps.sort() : [];
      }
    );
  }

  public unbind() {
    this.subscription.unsubscribe();
  }

  /**
   * Call getContainer in component's `created` lifecycle method to let the context know
   * that the component is planning to show intro pages. It's a good idea to just @autoinject() it.
   *
   * @param {string} name - name of your container, usually matches the file name w/o extension
   * @return {IntroContainer} An intro pages container that will work to show intro for this component
   *
   * @example
   *
   *      created() {
   *          this.intro = this.introContext.getContainer("COMPONENT_NAME");
   *      }
   */
  public getContainer(stepId: string): IntroContainer {
    if (stepId in this.containers) {
      return this.containers[stepId];
    } else {
      return (this.containers[stepId] = new IntroContainer(stepId));
    }
  }

  private getOrCreateContainerState(stepId: string) {
    if (this.introContainersState) {
      const container = this.introContainersState.find(c => c.stepId === stepId);
      if (container) {
        return container;
      }
    }
  }

  /**
   * Checks if a page was shown and marked as "done" by the user and selects only the pages
   * that are still not "done." Processes i18n on the go.
   * @param container Container assigned to this scope of intro pages
   * @param allPages All pages in this container
   */
  public getPagesToShow(container: IntroContainer, allPages: IIntroItem[]): IIntroItem[] {
    const pagesToShow: IIntroItem[] = [];
    const containerState = this.getOrCreateContainerState(container.name);
    allPages = allPages.map(p => pageWithDefaults(container, p));
    // fool proof:
    for (const page of allPages) {
      if (page.version < 1) {
        log.warn("Intro pages versions must be integers greater than 0", page);
      }
    }
    if (containerState.versionCompleted != null) {
      allPages = allPages.filter(p => p.version > containerState.versionCompleted);
    }
    let maxPageVersion = 0;
    for (const page of allPages) {
      let i18nId = page.intro;
      if (i18nId == null && page.id != null && page.id.length > 0) {
        i18nId = `${container.name}:intro.${page.id}`;
      }
      page.hint = page.intro = this.i18n.tr(page.intro);
      pagesToShow.push(page);
      if (page.version > maxPageVersion) {
        maxPageVersion = page.version;
      }
    }
    container.maxPageVersion = maxPageVersion;

    log.debug(`will show ${allPages.length} pages for ${container.name}; versionCompleted = ${containerState.versionCompleted}`);

    return pagesToShow;
  }

  public startHints(hints: Hint[]) {
    this.currentIntro.setOptions({ hints });
    if (!this.introIsRunning) {
      this.currentIntro.addHints();
      this.currentIntro.hideHints();
      this.introIsRunning = true;
    }
  }

  public startIntroWithPages(pagesToShow: IIntroItem[], startIntroOptions?: Options) {
    if (this.currentIntro != null) {
      this.stopCurrentIntro();
      this.currentIntro = null;
    }
    this.currentIntro = introJs();
    if (startIntroOptions == null) {
      startIntroOptions = { showStepNumbers: false, hintPosition: 'top-right' };
    }
    startIntroOptions.steps = pagesToShow;
    this.currentIntro.setOptions(startIntroOptions);

    if (pagesToShow.length > 0) {
      const context = this as IntroBuildingContext;
      this.currentIntro.onchange(function () {
        const introJs = this as IIntroJsPrivate;
        let previousPage: IIntroItem;
        if (introJs.previousItem == null || typeof introJs.previousItem === "undefined") {
          previousPage = null;
        } else {
          previousPage = introJs.previousItem;
        }
        const currentPage: IIntroItem = introJs._introItems[introJs._currentStep];
        introJs.previousItem = currentPage;
        if (previousPage && typeof previousPage.onStepExit === "function") {
          previousPage.onStepExit(context);
        }
        if (currentPage && typeof currentPage.onStepEnter === "function") {
          currentPage.onStepEnter(context);
        }
      });
      this.startCurrentIntro();
    }
  }

  /**
   * Called by the app.ts when the app is ready to run the intro (on RouterEvent.Success)
   * It will wait for all containers to be ready before starting, and will only show pages 
   * that have not been completed before.
   */
  public async startIntro(startIntroOptions?: Options) {
    let pagesToShow: IIntroItem[] = [];
    for (const container of Object.values(this.containers)) {
      let introPages = await container.waiter;
      introPages = this.getPagesToShow(container, introPages);
      for (const page of introPages) {
        pagesToShow.push(page);
      }
    }
    pagesToShow = pagesToShow.sort((a, b) => a.priority - b.priority);
    log.debug("will show pages", pagesToShow);

    this.startIntroWithPages(pagesToShow, startIntroOptions);
  }

  public showOnePage(pageIndex: number, page: IIntroItem) {
    log.debug("showOnePage", page, pageIndex, this.introIsRunning);
    this.currentIntro.showHint(pageIndex);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (this.currentIntro as unknown as IIntroJsPrivate).showHintDialog(pageIndex);
  }

  private startCurrentIntro() {
    this.currentIntro.onexit(() => {
      this.runOnExitHandlers();
      this.introIsRunning = false;
    });
    this.currentIntro.oncomplete(this.completeIntro);
    if (this.introStartHandle != null) {
      window.clearTimeout(this.introStartHandle);
      this.introStartHandle = null;
    }
    this.introStartHandle = window.setTimeout(() => {
      this.currentIntro.start();
      this.introIsRunning = true;
    }, 500);
  }

  private stopCurrentIntro() {
    if (this.currentIntro) {
      this.currentIntro.hideHints();
      this.currentIntro.exit();
    }
    this.introIsRunning = false;
  }

  /**
   * Stops current intro and marks all pages as seen.
   * @todo: see typescript-eslint/no-floating-promises
   */
  public completeIntro = () => {
    for (const container of Object.values(this.containers)) {
      const containerState = this.getOrCreateContainerState(container.name);
      if (container.maxPageVersion > 0) {
        containerState.versionCompleted = container.maxPageVersion;
        containerState.completedDate = new Date(Date.now());
        log.debug(`container ${containerState.stepId} completed, versionCompleted =`, containerState.versionCompleted);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.stateMutation.introActions.addOrUpdateIntroState(containerState);
      } else {
        log.debug(`container ${containerState.stepId} won't complete as the max version is set to ${container.maxPageVersion}, versionCompleted =`, containerState.versionCompleted);
      }
    }
    this.stopCurrentIntro();
  }

  /**
   * Clears this context before loading new containers for the new page. 
   * Called by the app.ts when the app is ready to starting off to another path (on RouterEvent.Processing).
   * It will ensure for all containers have completed before clearing, so it's importang that it's awaited.
   */
  public clear() {
    this.runOnExitHandlers();
    this.containers = {};
    this.stopCurrentIntro();
  }

  private runOnExitHandlers() {
    if (this.currentIntro != null) {
      // if a page is open, fire it's onStepExit (if defined)
      const privateIntroJs = this.currentIntro as unknown as IIntroJsPrivate;
      if (privateIntroJs._currentStep >= 0 && privateIntroJs._currentStep <= privateIntroJs._introItems.length) {
        const currentPage: IIntroItem = privateIntroJs._introItems[privateIntroJs._currentStep];
        if (currentPage && typeof currentPage.onStepExit === "function") {
          currentPage.onStepExit(this);
        }
      }
    }
  }
}

function pageWithDefaults(container: IntroContainer, page: IIntroItem): IIntroItem {
  return Object.assign({
    intro: `${container.name}:intro.${page.id}`,
    version: 1,
    priority: 10
  }, page);
}

interface IIntroJsPrivate {
  _currentStep: number,
  previousItem?: IIntroItem,
  _introItems: IIntroItem[],
  showHintDialog(stepId: number): void
}

export interface IIntroItem extends IIntroStep, IIntroHint { }

export interface IIntroStep {
  /**
   * Optional id if needed by the client code. Not used in the internal logic.
   */
  id?: string;
  /**
   * HTML element on which to show the message. `null` for full page messages.
   */
  element?: HTMLElement;
  /**
   * The message or a i18n key to show. If not defined, the IntroBuildingContext will try to build it using the following format: `${container.name}:intro.${page.id}`
   */
  intro: string;
  /**
   * Version of the message will be saved when the user clicks "done" on the intro. The message can be shown
   * again in one of two cases: if the version is higher than the max version of any message the user has seen
   * so far, or if the user clicks "show hints" again. The default version number is `1`.
   */
  version?: number;
  /**
   * Defines the order of pages in the introduction. Lower numbers shown first. The default priority is `10`.
   */
  priority?: number;
  /**
   * Called when the step starts
   */
  onStepEnter?: (introContext: IntroBuildingContext) => unknown;
  /**
   * Called before step ends
   */
  onStepExit?: (introContext: IntroBuildingContext) => unknown;
}

export interface IIntroHint {
  /**
   * Optional id if needed by the client code. Not used in the internal logic.
   */
  id?: string;
  /**
   * HTML element on which to show the message. `null` for full page messages.
   */
  element?: HTMLElement;
  /**
   * The message or a i18n key to show. If not defined, the IntroBuildingContext will try to build it using the following format: `${container.name}:intro.${page.id}`
   */
  hint: string;
  /**
   * Version of the message will be saved when the user clicks "done" on the intro. The message can be shown
   * again in one of two cases: if the version is higher than the max version of any message the user has seen
   * so far, or if the user clicks "show hints" again. The default version number is `1`.
   */
  version?: number;
  /**
   * Defines the order of pages in the introduction. Lower numbers shown first. The default priority is `10`.
   */
  priority?: number;
  /**
   * Called when the step starts
   */
  onStepEnter?: (introContext: IntroBuildingContext) => unknown;
  /**
   * Called before step ends
   */
  onStepExit?: (introContext: IntroBuildingContext) => unknown;
}

export class IntroContainer {
  public waiter: Promise<IIntroItem[]>;
  public ready: (value: IIntroItem[] | PromiseLike<IIntroItem[]>) => void;
  public cancel: (reason?: unknown) => void;
  public maxPageVersion: number;

  constructor(public name: string) {
    this.waiter = new Promise<IIntroItem[]>((resolve, reject) => {
      this.ready = resolve;
      this.cancel = reject;
    });
  }
}
