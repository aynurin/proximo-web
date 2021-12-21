import Ledger, { ILedger } from './../model/Ledger';
import { Store } from "aurelia-store";
import Account, { IAccount } from "../model/Account";
import CustomError from "../model/CustomError";
import Person, { IPerson } from "../model/Person";

export class LedgerActions {

  public constructor(private readonly store: Store<IPerson>) {}
  
  registerActions() {
    this.store.registerAction('mutateLedger', mutateLedgerAction);
  }

  public async mutateLedger(account: IAccount, ledger: ILedger) {
    await this.store.dispatch('mutateLedger', account, ledger);
  }
}

const mutateLedgerAction = (state: IPerson, account: IAccount, ledger: ILedger) => {
  return updateState(state, account, { mutate: ledger });
}

function updateState (state: IPerson, account: IAccount, updateLedger: { mutate: ILedger }): IPerson {
  const person = Person.cloneState(state);
  const accountIndex = person.accounts.findIndex(a => a.accountId == account.accountId);

  if (accountIndex < 0) {
    throw new CustomError(`Ledger to be mutated was not found (accountId: ${account.accountId})`);
  }

  account = Account.cloneState(person.accounts[accountIndex]);
  const ledger = Ledger.cloneState(account.ledger);

  ledger.transactions = updateLedger.mutate.transactions;
  ledger.dateUpdated = updateLedger.mutate.dateUpdated;

  account.ledger = ledger;
  person.accounts[accountIndex] = account;
  
  return person;
}
