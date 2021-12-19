import { Store } from "aurelia-store";
import { IAccount } from "../model/Account";
import CustomError from "../model/CustomError";
import Person, { IPerson } from "../model/Person";

export class AccountActions {

  public constructor(private readonly store: Store<IPerson>) {}
  
  registerActions() {
    this.store.registerAction('addAccount', addAccountAction);
    this.store.registerAction('updateAccount', updateAccountAction);
    this.store.registerAction('removeAccount', removeAccountAction);
  }

  public async addAccount(account: IAccount) {
    await this.store.dispatch('addAccount', account);
  }

  public async updateAccount(account: IAccount) {
    await this.store.dispatch('updateAccount', account);
  }

  public async removeAccount(account: IAccount) {
    await this.store.dispatch('removeAccount', account);
  }
}

const addAccountAction = (state: IPerson, account: IAccount) => {
  return updateState(state, { add: account });
}

const updateAccountAction = (state: IPerson, account: IAccount) => {
  return updateState(state, { update: account });
}

const removeAccountAction = (state: IPerson, account: IAccount) => {
  return updateState(state, { remove: account });
}

function updateState (state: IPerson, updateAccounts: { 
    add?: IAccount, 
    update?: IAccount, 
    remove?: IAccount }): IPerson {
  const newState = Person.cloneState(state);

  if (newState.accounts == null) {
    newState.accounts = [];
  }

  if (updateAccounts.add == null && updateAccounts.remove == null && updateAccounts.update == null) {
    newState.accounts = [...newState.accounts];
  } else {
    if (updateAccounts.add != null) {
      newState.accounts = [...newState.accounts, updateAccounts.add];
    }

    if (updateAccounts.update != null) {
      const newIdx = newState.accounts.findIndex(s => s.accountId == updateAccounts.update.accountId);
      if (newIdx >= 0) {
        newState.accounts = [...newState.accounts];
        // account schedule and ledger cannot be updated via update account
        // account id and dateCreated cannot be updated at all
        const newAccount = Object.assign({}, newState.accounts[newIdx]);
        newAccount.balance = updateAccounts.update.balance;
        newAccount.friendlyName = updateAccounts.update.friendlyName;
        newAccount.colorCode = updateAccounts.update.colorCode;
        newState.accounts[newIdx] = newAccount;
      } else {
        throw new CustomError(`Account with ID ${updateAccounts.update.accountId} to replace was not found for person ${newState.personId}`);
      }
    }

    if (updateAccounts.remove != null) {
      const newIdx = newState.accounts.findIndex(s => s.accountId == updateAccounts.remove.accountId);
      if (newIdx >= 0) {
        newState.accounts = [...newState.accounts];
        newState.accounts.splice(newIdx, 1);
      } else {
        throw new CustomError(`Account with ID ${updateAccounts.remove.accountId} to remove was not found for person ${newState.personId}`);
      }
    }
    
    newState.accounts.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));

    return newState;
  }
}
