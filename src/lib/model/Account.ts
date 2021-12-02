import { ILedger } from "./Ledger";
import { ITimeTable } from "./TimeTable";

export interface IAccount {
    accountId: string;

    timetable: ITimeTable;
    ledger: ILedger;

    friendlyName: string
    dateCreated: Date;
    balance: number;
    colorCode: string;
}

export default class Account {
  account: IAccount;

  constructor(account: IAccount) {
    this.account = account;
  }

  static cloneState(oldState: IAccount): IAccount {
    if (oldState == null) {
      return null;
    }
    return Object.assign({}, oldState);
  }
}
