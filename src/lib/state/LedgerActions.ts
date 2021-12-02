import Ledger, { ILedger } from './../model/Ledger';
import { Store } from "aurelia-store";
import Account from "../model/Account";
import CustomError from "../model/CustomError";
import Person, { IPerson } from "../model/Person";

export class LedgerActions {

  public constructor(private readonly store: Store<IPerson>) {}
  
  registerActions() {
    this.store.registerAction('mutateLedger', mutateLedgerAction);
  }

  public async mutateLedger(ledger: ILedger) {
    await this.store.dispatch('mutateLedger', ledger);
  }
}

const mutateLedgerAction = (state: IPerson, ledger: ILedger) => {
  return updateState(state, { mutate: ledger });
}

function updateState (state: IPerson, updateLedger: { mutate: ILedger }): IPerson {
  const person = Person.cloneState(state);
  const accountIndex = person.accounts.findIndex(a => a.accountId == updateLedger.mutate.accountId);

  if (accountIndex < 0) {
    throw new CustomError(`Ledger to be mutated was not found (accountId: ${updateLedger.mutate.accountId})`);
  }

  const account = Account.cloneState(person.accounts[accountIndex]);
  const ledger = Ledger.cloneState(account.ledger);

  ledger.transactions = updateLedger.mutate.transactions;
  ledger.dateUpdated = updateLedger.mutate.dateUpdated;

  account.ledger = ledger;
  person.accounts[accountIndex] = account;
  
  return person;
}
