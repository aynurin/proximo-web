import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { Store } from 'aurelia-store';

import { State } from 'lib/state';

import { AccountBalance } from 'lib/model/account-balance';
import { TranTemplate, TranGenerated } from 'lib/model/tran-template';

const log = LogManager.getLogger('tran-actions');

@autoinject
export class TranStateActions {
  public constructor(public store: Store<State>) {}

  public register() {
    this.store.registerAction('replaceSchedule', replaceScheduleAction);
    this.store.registerAction('addSchedule', addScheduleAction);
    this.store.registerAction('removeSchedule', removeTranAction);
    this.store.registerAction('saveAccount', saveAccountAction);
    this.store.registerAction('replaceLedger', replaceLedgerAction);
    this.store.registerAction('replaceAccounts', replaceAccountsAction);
  }

  public async replaceSchedule(original: TranTemplate, replacement: TranTemplate) {
    await this.store.dispatch('replaceSchedule', original, replacement);
  }

  public async addSchedule(tran: TranTemplate) {
    await this.store.dispatch('addSchedule', tran);
  }

  public async removeSchedule(tran: TranTemplate) {
    await this.store.dispatch('removeSchedule', tran);
  }

  public async saveAccount(account: AccountBalance) {
    await this.store.dispatch('saveAccount', account);
  }

  public async replaceLedger(ledger: TranGenerated[]) {
    await this.store.dispatch('replaceLedger', ledger);
  }

  public async replaceAccounts(accounts: AccountBalance[]) {
    await this.store.dispatch('replaceAccounts', accounts);
  }
}

const replaceScheduleAction = (state: State, original: TranTemplate, replacement: TranTemplate) => {
  const newState = Object.assign({}, state);
  newState.schedule = [...newState.schedule];
  const position = newState.schedule.findIndex((tran) => tran === original);
  if (position >= 0) {
    newState.schedule[position] = replacement;
  }
  
  if (typeof newState.accounts2 == 'undefined') {
    newState.accounts2 = [];
  }
  if (newState.accounts2.find(acc => acc.account == replacement.account) == null) {
    let newAccounts = [...newState.accounts2, { account: replacement.account, date: new Date(), balance: 0, inUse: true }];
    newAccounts.sort((a, b) => a.account.localeCompare(b.account));
    newState.accounts2 = newAccounts;
  }
  if (newState.scheduleVersion == null) {
    newState.scheduleVersion = 1;
  } else {
    newState.scheduleVersion += 1;
    log.debug("replaceSchedule, new version:", newState.scheduleVersion);
  }
  return newState;
}

const addScheduleAction = (state: State, tran: TranTemplate) => {
  const newState = Object.assign({}, state);
  newState.schedule = [...newState.schedule, tran];
  
  if (typeof newState.accounts2 == 'undefined') {
    newState.accounts2 = [];
  }
  if (newState.accounts2.find(acc => acc.account == tran.account) == null) {
    let newAccounts = [...newState.accounts2.filter(a => a.account), { account: tran.account, date: new Date(), balance: 0, inUse: true }];
    newAccounts.sort((a, b) => a.account.localeCompare(b.account));
    newState.accounts2 = newAccounts;
  }
  if (newState.scheduleVersion == null) {
    newState.scheduleVersion = 1;
  } else {
    newState.scheduleVersion += 1;
    log.debug("addSchedule, new version:", newState.scheduleVersion);
  }

  return newState;
}

const removeTranAction = (state: State, tran: TranTemplate) => {
  let index = state.schedule.indexOf(tran);
  if (index !== -1) {
    const newState = Object.assign({}, state);
    newState.schedule = [...newState.schedule];
    newState.schedule.splice(index, 1);
    if (newState.scheduleVersion == null) {
      newState.scheduleVersion = 1;
    } else {
      newState.scheduleVersion += 1;
      log.debug("removeTran, new version:", newState.scheduleVersion);
    }
    return newState;
  }
  return false;
}

const saveAccountAction = (state: State, account: AccountBalance) => {
  const newState = Object.assign({}, state);

  let newAccounts = [...newState.accounts2.filter(f => f.account != account.account && f.account), 
      Object.assign({}, account)];
  newAccounts.sort((a, b) => a.account.localeCompare(b.account));
  newState.accounts2 = newAccounts;
  if (newState.scheduleVersion == null) {
    newState.scheduleVersion = 1;
  } else {
    newState.scheduleVersion += 1;
    log.debug("saveAccount, new version:", newState.scheduleVersion);
  }

  return newState;
}

const replaceLedgerAction = (state: State, ledger: TranGenerated[]) => {
  const newState = Object.assign({}, state);
  newState.ledger = ledger;
  return newState;
}

const replaceAccountsAction = (state: State, accounts: AccountBalance[]) => {
  const newState = Object.assign({}, state);
  newState.accounts2 = accounts;
  return newState;
}
