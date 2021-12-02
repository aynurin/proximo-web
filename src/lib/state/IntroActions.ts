import { Store } from "aurelia-store";
import { IIntroStep } from "lib/model/IntroStep";
import CustomError from "../model/CustomError";
import Person, { IPerson } from "../model/Person";

export class IntroActions {

  public constructor(private readonly store: Store<IPerson>) {}
  
  registerActions() {
    this.store.registerAction('addIntroStep', addIntroStepAction);
    this.store.registerAction('updateIntroStep', updateIntroStepAction);
    this.store.registerAction('removeIntroStep', removeIntroStepAction);
  }

  public async addIntroStep(introStep: IIntroStep) {
    await this.store.dispatch('addIntroStep', introStep);
  }

  public async updateIntroStep(introStep: IIntroStep) {
    await this.store.dispatch('updateIntroStep', introStep);
  }

  public async removeIntroStep(introStep: IIntroStep) {
    await this.store.dispatch('removeIntroStep', introStep);
  }
}

const addIntroStepAction = (state: IPerson, introStep: IIntroStep) => {
  return updateState(state, { add: introStep });
}

const updateIntroStepAction = (state: IPerson, introStep: IIntroStep) => {
  return updateState(state, { replace: introStep });
}

const removeIntroStepAction = (state: IPerson, introStep: IIntroStep) => {
  return updateState(state, { remove: introStep });
}

function updateState (state: IPerson, updateIntroPages: { 
    add?: IIntroStep, 
    replace?: IIntroStep, 
    remove?: IIntroStep }): IPerson {
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

    newState.introSteps.sort((a,b) => a.stepId.localeCompare(b.stepId));

    return newState;
  }
}
