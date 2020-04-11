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
import 'intro.js/themes/introjs-nazanin.css';

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

    constructor(
        public store: Store<State>,
        private i18n: I18N,
        private introStateActions: IntroStateActions) {}

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
     *          this.intro = this.introContext.getContainer("accounts-summary");
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
        let intro = introJs();
        let pagesAdded = 0;
        for (let container of Object.values(this.containers)) {
            let introPages = await container.waiter;
            let containerState = this.getOrCreateContainerState(container.name);
            log.debug(container.name, containerState);
            if (containerState.versionCompleted != null) {
                introPages = introPages.filter(p => p.version > containerState.versionCompleted);
            }
            let maxPageVersion = 0;
            log.debug("startIntro", container.name, introPages);
            for (let page of introPages) {
                page.intro = this.i18n.tr(page.intro);
                intro.addStep(page);
                pagesAdded++;
                if (page.version > maxPageVersion) {
                    maxPageVersion = page.version;
                }
            }
            container.maxPageVersion = maxPageVersion;
        }
        if (pagesAdded > 0) {
            intro.oncomplete(() => {
                for (let container of Object.values(this.containers)) {
                    let containerState = this.getOrCreateContainerState(container.name);
                    log.debug(container.name, containerState);
                    containerState.versionCompleted = container.maxPageVersion;
                    containerState.completedDate = new Date().toISOString();
                    log.debug("container completed", containerState.name, containerState.versionCompleted);
                    this.introStateActions.addOrUpdateContainer(containerState);
                }
            });
            intro.start();
        }
    }

    /**
     * Clears this context before loading new containers for the new page. 
     * Called by the app.ts when the app is ready to starting off to another pate (on RouterEvent.Processing).
     * It will ensure for all containers have completed before clearing, so it's importang that it's awaited.
     */
    public async clear() {
        await Promise.all(Object.values(this.containers).map(w => w.waiter));
        this.containers = {};
    }
}

export interface IIntroPage {
    element: HTMLElement;
    intro: string;
    version: number;
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