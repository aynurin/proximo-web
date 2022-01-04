import { Store } from "aurelia-store";
import Account from "../model/Account";
import CustomError from "../model/CustomError";
import Person, { IPerson } from "../model/Person";
import { IScheduledTransaction } from "../model/ScheduledTransaction";
import TimeTable from "../model/TimeTable";

export class TimeTableActions {

  public constructor(private readonly store: Store<IPerson>) {}
  
  registerActions() {
    this.store.registerAction('addScheduled', addScheduledAction);
    this.store.registerAction('replaceScheduled', replaceScheduledAction);
    this.store.registerAction('removeScheduled', removeScheduledAction);
  }

  public async replaceScheduled(scheduled: IScheduledTransaction) {
    await this.store.dispatch('replaceScheduled', scheduled);
  }

  public async addScheduled(scheduled: IScheduledTransaction) {
    await this.store.dispatch('addScheduled', scheduled);
  }

  public async removeScheduled(scheduled: IScheduledTransaction) {
    await this.store.dispatch('removeScheduled', scheduled);
  }
}

const addScheduledAction = (state: IPerson, scheduledTransaction: IScheduledTransaction) => {
  return updateState(state, scheduledTransaction.accountId, { add: scheduledTransaction });
}

const replaceScheduledAction = (state: IPerson, scheduledTransaction: IScheduledTransaction) => {
  return updateState(state, scheduledTransaction.accountId, { replace: scheduledTransaction });
}

const removeScheduledAction = (state: IPerson, scheduledTransaction: IScheduledTransaction) => {
  return updateState(state, scheduledTransaction.accountId, { remove: scheduledTransaction });
}

function updateState(state: IPerson, accountId: string, updateTimetable: { 
    add?: IScheduledTransaction, 
    replace?: IScheduledTransaction, 
    remove?: IScheduledTransaction }): IPerson {

  const person = Person.cloneState(state);

  const accountIndex = person.accounts.findIndex(a => a.accountId == accountId);

  if (accountIndex < 0) {
    throw new CustomError(`Account to be replaced was not found (accountId: ${accountId})`);
  }

  const account = Account.cloneState(person.accounts[accountIndex]);
  const timetable = TimeTable.cloneState(account.timetable);

  if (updateTimetable == null || (updateTimetable.add == null && updateTimetable.replace == null && updateTimetable.remove == null)) {
    timetable.timetable = [...timetable.timetable];
  } else {
    if (updateTimetable.add != null) {
      timetable.timetable = [...timetable.timetable, updateTimetable.add];
    }

    if (updateTimetable.replace != null) {
      const newIdx = timetable.timetable.findIndex(s => s.scheduledId == updateTimetable.replace.scheduledId);
      if (newIdx >= 0) {
        timetable.timetable = [...timetable.timetable];
        updateTimetable.replace._generation += 1;
        timetable.timetable[newIdx] = updateTimetable.replace;
      } else {
        throw new CustomError(`Scheduled transaction with ID ${updateTimetable.replace.scheduledId} to replace was not found in account ${updateTimetable.replace.accountId} timetable`)
      }
    }

    if (updateTimetable.remove != null) {
      const newIdx = timetable.timetable.findIndex(s => s.scheduledId == updateTimetable.remove.scheduledId);
      if (newIdx >= 0) {
        timetable.timetable = [...timetable.timetable];
        timetable.timetable.splice(newIdx, 1);
      } else {
        throw new CustomError(`Scheduled transaction with ID ${updateTimetable.replace.scheduledId} to remove was not found in account ${updateTimetable.replace.accountId} timetable`)
      }
    }
  }

  account.timetable = timetable;
  person.accounts[accountIndex] = account;

  return person;
}
