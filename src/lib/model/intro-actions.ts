import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { Store } from 'aurelia-store';

import { State } from 'lib/state';

import { IContainerInfo } from "lib/model/intro-container";

const log = LogManager.getLogger('intro-actions');

@autoinject
export class IntroStateActions {
  public constructor(public store: Store<State>) {}

  public register() {
    this.store.registerAction('addOrUpdateContainer', addOrUpdateContainerAction);
  }

  public async addOrUpdateContainer(intro: IContainerInfo) {
    await this.store.dispatch('addOrUpdateContainer', intro);
  }
}

const addOrUpdateContainerAction = (state: State, intro: IContainerInfo) => {
  const newState = Object.assign({}, state);
  if (state.introContainers != null) {
    const position = state.introContainers.findIndex(i => i.name === intro.name);
    if (position >= 0) {
      newState.introContainers = [...newState.introContainers];
      newState.introContainers[position] = intro;
    } else {
      newState.introContainers = [...newState.introContainers, intro].sort((a,b) => a.name.localeCompare(b.name));
    }
  } else {
    newState.introContainers = [intro];
  }
  log.debug("addOrUpdateContainerAction", newState.introContainers);
  return newState;
}
