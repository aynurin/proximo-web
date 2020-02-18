import { Store } from 'aurelia-store';
import { State } from '../state';
import { TranTemplate } from './tran-template';
import { AccountBalance } from './account-balance';

export class TranStateActions {
  public constructor(public store: Store<State>) {}

  public register() {
    this.store.registerAction('addTran', addTranAction);
    this.store.registerAction('removeTran', removeTranAction);
    this.store.registerAction('saveAccount', saveAccountAction);
  }

  public addTran(tran: TranTemplate) {
    this.store.dispatch('addTran', tran);
  }

  public removeTran(tran: TranTemplate) {
    this.store.dispatch('removeTran', tran);
  }

  public saveAccount(account: AccountBalance) {
    this.store.dispatch('saveAccount', account);
  }
}

const addTranAction = (state: State, tran: TranTemplate) => {
  const newState = Object.assign({}, state);
  newState.schedule = [...newState.schedule, tran];
  
  if (typeof newState.accounts2 == 'undefined') {
    newState.accounts2 = [];
  }
  if (newState.accounts2.find(acc => acc.account == tran.account) == null) {
    let newAccounts = [...newState.accounts2, { account: tran.account, date: new Date(), balance: 0 }];
    newAccounts.sort((a, b) => a.account.localeCompare(b.account));
    newState.accounts2 = newAccounts;
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

const saveAccountAction = (state: State, account: AccountBalance) => {
  const newState = Object.assign({}, state);

  let newAccounts = [...newState.accounts2.filter(f => f.account != account.account), 
      Object.assign({}, account)];
  newAccounts.sort((a, b) => a.account.localeCompare(b.account));
  newState.accounts2 = newAccounts;

  return newState;
}
