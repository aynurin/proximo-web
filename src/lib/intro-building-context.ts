import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { Store } from "aurelia-store";

import introJs from "intro.js";
import { Subscription } from "rxjs";

import { State } from "lib/state";
import { IContainerInfo } from "lib/model/intro-container";
import { IntroStateActions } from "lib/model/intro-actions";

import 'intro.js/introjs.css';
// import 'intro.js/themes/introjs-nazanin.css';

const log = LogManager.getLogger('intro-building-context');

/**
 * This class should be a singleton and contains all intro related building blocks and 
 * logic for the app
 */
@autoinject()
export class IntroBuildingContext {
    private introContainersState: IContainerInfo[];
    private subscription: Subscription;
    // public introContainersState: IContainerInfo[];
    private containers: { [name: string]: IntroContainer } = {};
    private currentIntro: any = null;
    private introIsRunning: boolean = false;
    private introStartHandle: number = 0;

    constructor(
        public store: Store<State>,
        private i18n: I18N,
        private introStateActions: IntroStateActions) { }

    public bind() {
        this.subscription = this.store.state.subscribe(
            (state) => {
                this.introContainersState = state.introContainers ? state.introContainers.sort((a, b) => a.name.localeCompare(b.name)) : [];
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
    public getContainer(name: string): IntroContainer {
        if (name in this.containers) {
            return this.containers[name];
        } else {
            return (this.containers[name] = new IntroContainer(name));
        }
    }

    private getOrCreateContainerState(name: string) {
        if (this.introContainersState) {
            let container = this.introContainersState.find(c => c.name === name);
            if (container) {
                return container;
            }
        }
        return { name };
    }

    /**
     * Checks if a page was shown and marked as "done" by the user and selects only the pages
     * that are still not "done." Processes i18n on the go.
     * @param container Container assigned to this scope of intro pages
     * @param allPages All pages in this container
     */
    public getPagesToShow(container: IntroContainer, allPages: IIntroPage[]): IIntroPage[] {
        let pagesToShow: IIntroPage[] = [];
        let containerState = this.getOrCreateContainerState(container.name);
        allPages = allPages.map(p => pageWithDefaults(container, p));
        // fool proof:
        for (let page of allPages) {
            if (page.version < 1) {
                log.warn("Intro pages versions must be integers greater than 0", page);
            }
        }
        if (containerState.versionCompleted != null) {
            allPages = allPages.filter(p => p.version > containerState.versionCompleted);
        }
        let maxPageVersion = 0;
        for (let page of allPages) {
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

    public startHints(hints: IIntroPage[]) {
      this.currentIntro.setOption("hints", hints);
      if (!this.introIsRunning) {
          this.currentIntro.addHints();
          this.currentIntro.hideHints();
          this.introIsRunning = true;
      }
    }

    public startIntroWithPages(pagesToShow: IIntroPage[], startIntroOptions?: any) {
      if (this.currentIntro != null) {
          this.stopCurrentIntro();
          this.currentIntro = null;
      }
      this.currentIntro = introJs();
      if (startIntroOptions == null) {
          startIntroOptions = { showStepNumbers: false, hintPosition: 'top-right' };
      }
      this.currentIntro.setOptions(startIntroOptions);
      this.currentIntro.setOption("steps", pagesToShow);

      if (pagesToShow.length > 0) {
        let _self = this;
        this.currentIntro.onchange(function () {
            let previousPage: IIntroPage;
            if (this.previousItem == null || typeof this.previousItem === "undefined") {
                previousPage = null;
            } else {
                previousPage = this.previousItem;
            }
            let currentPage: IIntroPage = this._introItems[this._currentStep];
            this.previousItem = currentPage;
            if (previousPage && typeof previousPage.onStepExit === "function") {
                previousPage.onStepExit(_self);
            }
            if (currentPage && typeof currentPage.onStepEnter === "function") {
                currentPage.onStepEnter(_self);
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
    public async startIntro(startIntroOptions?: any) {
        let pagesToShow: IIntroPage[] = [];
        for (let container of Object.values(this.containers)) {
            let introPages = await container.waiter;
            introPages = this.getPagesToShow(container, introPages);
            for (let page of introPages) {
              pagesToShow.push(page);
            }
        }
        pagesToShow = pagesToShow.sort((a, b) => a.priority - b.priority);
        log.debug("will show pages", pagesToShow);

        this.startIntroWithPages(pagesToShow, startIntroOptions);
    }

    public showOnePage(pageIndex: number, page: IIntroPage) {
        log.debug("showOnePage", page, pageIndex, this.introIsRunning);
        this.currentIntro.showHint(pageIndex);
        this.currentIntro.showHintDialog(pageIndex);
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
     */
    public completeIntro = async() => {
        for (let container of Object.values(this.containers)) {
            let containerState = this.getOrCreateContainerState(container.name);
            if (container.maxPageVersion > 0) {
                containerState.versionCompleted = container.maxPageVersion;
                containerState.completedDate = new Date().toISOString();
                log.debug(`container ${containerState.name} completed, versionCompleted =`, containerState.versionCompleted);
                await this.introStateActions.addOrUpdateContainer(containerState);
            } else {
              log.debug(`container ${containerState.name} won't complete as the max version is set to ${container.maxPageVersion}, versionCompleted =`, containerState.versionCompleted);
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
            if (this.currentIntro._currentStep >= 0 && this.currentIntro._currentStep <= this.currentIntro._introItems.length) {
                let currentPage: IIntroPage = this.currentIntro._introItems[this.currentIntro._currentStep];
                if (currentPage && typeof currentPage.onStepExit === "function") {
                    currentPage.onStepExit(this);
                }
            }
        }
    }
}

function pageWithDefaults(container: IntroContainer, page: IIntroPage): IIntroPage {
    return Object.assign({
        intro: `${container.name}:intro.${page.id}`,
        version: 1,
        priority: 10
    }, page);
}

export interface IIntroPage {
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
    intro?: string;
    /**
     * The message or a i18n key to show. If not defined, the IntroBuildingContext will try to build it using the following format: `${container.name}:intro.${page.id}`
     */
    hint?: string;
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
    onStepEnter?: (introContext: IntroBuildingContext) => any;
    /**
     * Called before step ends
     */
    onStepExit?: (introContext: IntroBuildingContext) => any;
}

export class IntroContainer {
    public waiter: Promise<IIntroPage[]>;
    public ready: (value: IIntroPage[] | PromiseLike<IIntroPage[]>) => void;
    public cancel: (reason?: any) => void;
    public maxPageVersion: number;

    constructor(public name: string) {
        this.waiter = new Promise<IIntroPage[]>((resolve, reject) => {
            this.ready = resolve;
            this.cancel = reject;
        });
    }
}
