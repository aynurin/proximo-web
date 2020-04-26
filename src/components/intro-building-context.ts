import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { Store } from "aurelia-store";

import * as introJs from "intro.js";
import { Subscription } from "rxjs";

import { State } from "state";
import { IContainerInfo } from "model/intro-container";
import { IntroStateActions } from "model/intro-actions";

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

    constructor(
        public store: Store<State>,
        private i18n: I18N,
        private introStateActions: IntroStateActions) { }

    public bind() {
        log.debug("bind");
        this.subscription = this.store.state.subscribe(
            (state) => {
                this.introContainersState = state.introContainers.sort((a, b) => a.name.localeCompare(b.name));
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
     * Called by the app.ts when the app is ready to run the intro (on RouterEvent.Success)
     * It will wait for all containers to be ready before starting, and will only show pages 
     * that have not been completed before.
     */
    public async startIntro() {
        if (this.currentIntro != null) {
            this.currentIntro.exit();
        }
        this.currentIntro = introJs();
        this.currentIntro.setOptions({
            showStepNumbers: false
        });
        const pagesToAdd: IIntroPage[] = [];
        for (let container of Object.values(this.containers)) {
            let introPages = await container.waiter;
            let containerState = this.getOrCreateContainerState(container.name);
            log.debug(container.name, containerState);
            // fool proof:
            for (let page of introPages) {
                if (page.version < 1) {
                    console.warn("Intro pages versions must be integers greater than 0", page);
                }
            }
            if (containerState.versionCompleted != null) {
                introPages = introPages.filter(p => p.version > containerState.versionCompleted);
            }
            let maxPageVersion = 0;
            log.debug("startIntro", container.name, introPages);
            for (let page of introPages) {
                page.intro = this.i18n.tr(page.intro);
                pagesToAdd.push(page);
                if (page.version > maxPageVersion) {
                    maxPageVersion = page.version;
                }
            }
            container.maxPageVersion = maxPageVersion;
        }
        if (pagesToAdd.length > 0) {
            let sortedPages = pagesToAdd.sort((a, b) => a.priority - b.priority);
            for (let page of sortedPages) {
                this.currentIntro.addStep(page);
            }
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
            this.currentIntro.oncomplete(this.completeIntro);
            this.currentIntro.start();
        }
    }

    public completeIntro = async() => {
        log.debug("completeIntro", this.containers);
        for (let container of Object.values(this.containers)) {
            let containerState = this.getOrCreateContainerState(container.name);
            log.debug(container.name, containerState);
            if (container.maxPageVersion > 0) {
                containerState.versionCompleted = container.maxPageVersion;
                containerState.completedDate = new Date().toISOString();
                log.debug("container completed", containerState.name, containerState.versionCompleted);
                await this.introStateActions.addOrUpdateContainer(containerState);
            }
        }
    }

    /**
     * Clears this context before loading new containers for the new page. 
     * Called by the app.ts when the app is ready to starting off to another path (on RouterEvent.Processing).
     * It will ensure for all containers have completed before clearing, so it's importang that it's awaited.
     */
    public async clear() {
        log.debug("clearing");
        await Promise.all(Object.values(this.containers).map(w => w.waiter));
        // if a page is open, fire it's onStepExit (if defined)
        if (this.currentIntro._currentStep >= 0 && this.currentIntro._currentStep <= this.currentIntro._introItems.length) {
            let currentPage: IIntroPage = this.currentIntro._introItems[this.currentIntro._currentStep];
            if (currentPage && typeof currentPage.onStepExit === "function") {
                currentPage.onStepExit(this);
            }
        }
        this.containers = {};
    }
}

export interface IIntroPage {
    /**
     * HTML element on which to show the message. `null` for full page messages.
     */
    element?: HTMLElement;
    /**
     * The message or a i18n key to show.
     */
    intro: string;
    /**
     * Version of the message will be saved when the user clicks "done" on the intro. The message can be shown
     * again in one of two cases: if the version is higher than the max version of any message the user has seen
     * so far, or if the user clicks "show hints" again.
     */
    version: number;
    /**
     * Defines the order of pages in the introduction. Lower numbers shown first.
     */
    priority: number;
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