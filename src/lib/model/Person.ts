import { IAccount } from "./Account";
import CustomError from "./CustomError";
import { IIntroState } from "./IntroState";

export interface IPerson {
  personId: string;
  accounts: IAccount[];
  introSteps: IIntroState[];
}

export default class Person {
  person: IPerson;

  constructor(person: IPerson) {
    if (person == null) {
      throw new CustomError("Null initialization of Person");
    }
    this.person = person;
  }

  hasSchedules() : boolean {
    return this.person != null 
      && this.person.accounts != null 
      && this.person.accounts.length > 0 
      && this.person.accounts.find(a => a != null && a.timetable != null && a.timetable.timetable.length > 0) != null;
  }

  hasLedgers(): boolean {
    return this.person != null 
      && this.person.accounts != null 
      && this.person.accounts.length > 0 
      && this.person.accounts.some(a => a.ledger?.transactions.length > 0);
  }

  getAccount(accountId: string): IAccount {
    if (this.person.accounts == null || this.person.accounts.length == 0) {
      return null;
    }
    return this.person.accounts.find(a => a.accountId == accountId);
  }

  static cloneState(oldState: IPerson) : IPerson {
    return Object.assign({}, oldState);
  }
}
