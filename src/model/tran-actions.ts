import { autoinject } from "aurelia-framework";
import { Store } from 'aurelia-store';
import { EventAggregator } from "aurelia-event-aggregator";
import { State } from '../state';
import { TranTemplate, TranGenerated } from './tran-template';
import { AccountBalance } from './account-balance';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('tran-actions');

@autoinject
export class TranStateActions {
  public constructor(public store: Store<State>, private ea: EventAggregator) {}

  public register() {
    this.store.registerAction('replaceSchedule', replaceScheduleAction);
    this.store.registerAction('addSchedule', addTranAction);
    this.store.registerAction('removeSchedule', removeTranAction);
    this.store.registerAction('saveAccount', saveAccountAction);
    this.store.registerAction('replaceLedger', replaceLedgerAction);
    this.store.registerAction('replaceAccounts', replaceAccountsAction);
  }

  public replaceSchedule(original: TranTemplate, replacement: TranTemplate) {
    this.store.dispatch('replaceSchedule', original, replacement);
  }

  public addSchedule(tran: TranTemplate) {
    this.store.dispatch('addSchedule', tran);
  }

  public removeSchedule(tran: TranTemplate) {
    this.store.dispatch('removeSchedule', tran);
  }

  public saveAccount(account: AccountBalance) {
    this.store.dispatch('saveAccount', account);
  }

  public replaceLedger(ledger: TranGenerated[]) {
    this.store.dispatch('replaceLedger', ledger);
  }

  public replaceAccounts(accounts: AccountBalance[]) {
    this.store.dispatch('replaceAccounts', accounts);
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

const addTranAction = (state: State, tran: TranTemplate) => {
  const newState = Object.assign({}, state);
  newState.schedule = [...newState.schedule, tran];
  
  if (typeof newState.accounts2 == 'undefined') {
    newState.accounts2 = [];
  }
  if (newState.accounts2.find(acc => acc.account == tran.account) == null) {
    let newAccounts = [...newState.accounts2, { account: tran.account, date: new Date(), balance: 0, inUse: true }];
    newAccounts.sort((a, b) => a.account.localeCompare(b.account));
    newState.accounts2 = newAccounts;
  }
  if (newState.scheduleVersion == null) {
    newState.scheduleVersion = 1;
  } else {
    newState.scheduleVersion += 1;
    log.debug("addTran, new version:", newState.scheduleVersion);
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
