import { Store } from "aurelia-store";
import { IIntroState } from "lib/model/IntroState";
import CustomError from "../model/CustomError";
import Person, { IPerson } from "../model/Person";

export class IntroActions {

  public constructor(private readonly store: Store<IPerson>) { }

  registerActions() {
    this.store.registerAction('addIntroState', addIntroStateAction);
    this.store.registerAction('addOrUpdateIntroState', addOrUpdateIntroStateAction);
    this.store.registerAction('updateIntroState', updateIntroStateAction);
    this.store.registerAction('removeIntroState', removeIntroStateAction);
  }

  /**
   * @todo Avoid use of addOrUpdate as that means that you don't know what's going on
   * @deprecated
   */
  public async addOrUpdateIntroState(introStep: IIntroState) {
    await this.store.dispatch('addOrUpdateIntroState', introStep);
  }

  public async addIntroState(introStep: IIntroState) {
    await this.store.dispatch('addIntroState', introStep);
  }

  public async updateIntroState(introStep: IIntroState) {
    await this.store.dispatch('updateIntroState', introStep);
  }

  public async removeIntroState(introStep: IIntroState) {
    await this.store.dispatch('removeIntroState', introStep);
  }
}

const addIntroStateAction = (state: IPerson, introStep: IIntroState) => {
  return updateState(state, { add: introStep });
}

/**
 * @todo Avoid use of addOrUpdate as that means that you don't know what's going on
 * @deprecated
 */
const addOrUpdateIntroStateAction = (state: IPerson, introStep: IIntroState) => {
  return updateState(state, { add: introStep, replace: introStep });
}

const updateIntroStateAction = (state: IPerson, introStep: IIntroState) => {
  return updateState(state, { replace: introStep });
}

const removeIntroStateAction = (state: IPerson, introStep: IIntroState) => {
  return updateState(state, { remove: introStep });
}

function updateState(state: IPerson, updateIntroPages: {
  add?: IIntroState,
  replace?: IIntroState,
  remove?: IIntroState
}): IPerson {
  const newState = Person.cloneState(state);

  if (newState.introSteps == null) {
    newState.introSteps = [];
  }

  if (updateIntroPages.add == null && updateIntroPages.remove == null && updateIntroPages.replace == null) {
    newState.introSteps = [...newState.introSteps];
  } else {
    if (updateIntroPages.add != null) {
      newState.introSteps = [...newState.introSteps, updateIntroPages.add];
    }

    if (updateIntroPages.replace != null) {
      const newIdx = newState.introSteps.findIndex(s => s.stepId == updateIntroPages.replace.stepId);
      if (newIdx >= 0) {
        newState.introSteps = [...newState.introSteps];
        newState.introSteps[newIdx] = updateIntroPages.replace;
      } else {
        throw new CustomError(`Intro Step ${updateIntroPages.replace.stepId} to replace was not found for person ${newState.personId}`);
      }
    }

    if (updateIntroPages.remove != null) {
      const newIdx = newState.introSteps.findIndex(s => s.stepId == updateIntroPages.remove.stepId);
      if (newIdx >= 0) {
        newState.introSteps = [...newState.introSteps];
        newState.introSteps.splice(newIdx, 1);
      } else {
        throw new CustomError(`Account with ID ${updateIntroPages.remove.stepId} to remove was not found for person ${newState.personId}`);
      }
    }

    newState.introSteps.sort((a, b) => a.stepId.localeCompare(b.stepId));

    return newState;
  }
}
