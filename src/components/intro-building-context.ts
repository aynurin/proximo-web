import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import {I18N} from 'aurelia-i18n';

import * as introJs from "intro.js";

import 'intro.js/introjs.css';
import 'intro.js/themes/introjs-nazanin.css';

const log = LogManager.getLogger('intro-building-context');

/**
 * This class should be a singleton and contains all intro related building blocks and 
 * logic for the app
 */
@autoinject()
export class IntroBuildingContext {
    storedInfo: { [name: string]: IContainerInfo } = {};
    containers: { [name: string]: IntroContainer } = {};

    constructor(private i18n: I18N) {}

    /**
     * Call getContainer in the component's `created` lifecycle method to let the context know
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
    getContainer(name: string): IntroContainer {
        let container = this.getOrCreateContainer(name);
        container.info = this.getOrCreateContainerInfo(name);
        return container;
    }

    private getOrCreateContainer(name: string) {
        if (name in this.containers) {
            return this.containers[name];
        } else {
            return (this.containers[name] = new IntroContainer(name));
        }
    }

    private getOrCreateContainerInfo(name: string) {
        if (name in this.storedInfo) {
            return this.storedInfo[name];
        } else {
            return (this.storedInfo[name] = { name: name });
        }
    }

    /**
     * Called by the app.ts when the app is ready to run the intro (on RouterEvent.Success)
     * It will wait for all containers to be ready before starting, and will only show pages 
     * that have not been completed before.
     */
    public async startIntro() {
        let intro = introJs();
        let stepsAdded = 0;
        for (let container of Object.values(this.containers)) {
            let introPages = (await container.waiter).filter(
                p => container.info.versionCompleted < p.version || 
                     container.info.versionCompleted == null);
            let maxPageVersion = 0;
            log.debug("startIntro", container.name, introPages);
            for (let page of introPages) {
                page.intro = this.i18n.tr(page.intro);
                intro.addStep(page);
                stepsAdded++;
                if (page.version > maxPageVersion) {
                    maxPageVersion = page.version;
                }
            }
            container.maxPageVersion = maxPageVersion;
        }
        if (stepsAdded > 0) {
            intro.oncomplete(() => {
                for (let container of Object.values(this.containers)) {
                    container.completed();
                    this.containerCompleted(container.name, container.maxPageVersion);
                }
            });
            intro.start();
        }
    }

    /**
     * Called by introJs.oncomplete (see startIntro() body). Marks this conatiner version as 
     * completed so it's not shown again. The completion information is intended to be stored 
     * in app state.
     */
    private containerCompleted(name: string, version: number) {
        log.debug("completed", name, version);
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

export interface IContainerInfo {
    name: string;
    versionCompleted?: number;
    completedDate?: string;
}

export class IntroContainer {
    public info: IContainerInfo;
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

    public completed() {
        this.info.versionCompleted = this.maxPageVersion;
        this.info.completedDate = new Date().toISOString();
    }
}