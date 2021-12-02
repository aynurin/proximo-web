import { IAccount } from "./Account";
import { IIntroStep } from "./IntroStep";

export interface IPerson {
  personId: string;
  accounts: IAccount[];
  introSteps: IIntroStep[];
}

export default class Person {
  person: IPerson;

  constructor(person: IPerson) {
    this.person = person;
  }

  hasAnySchedules() : boolean {
    return this.person.accounts != null 
      && this.person.accounts.length > 0 
      && this.person.accounts.find(a => a != null && a.timetable != null && a.timetable.timetable.length > 0) != null;
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
