import { Store } from 'aurelia-store';
import { State } from '../state';
import { TranTemplate } from './tran-template';

export class TranStateActions {
  public constructor(public store: Store<State>) {}

  public register() {
    this.store.registerAction('addTran', addTranAction);
    this.store.registerAction('removeTran', removeTranAction);
  }

  public addTran(tran: TranTemplate) {
    this.store.dispatch('addTran', tran);
  }

  public removeTran(tran: TranTemplate) {
    this.store.dispatch('removeTran', tran);
  }
}

const addTranAction = (state: State, tran: TranTemplate) => {
  const newState = Object.assign({}, state);
  newState.schedule = [...newState.schedule, tran];
  
  if (newState.accounts.find(acc => acc == tran.account) == null) {
    let newAccounts = [...newState.accounts, tran.account];
    newAccounts.sort((a, b) => a.localeCompare(b));
    newState.accounts = newAccounts;
  }

  return newState;
}

const removeTranAction = (state: State, tran: TranTemplate) => {
  let index = state.schedule.indexOf(tran);
  if (index !== -1) {
    const newState = Object.assign({}, state);
    newState.schedule = [...newState.schedule];
    newState.schedule.splice(index, 1);
    return newState;
  }
  return state;
}