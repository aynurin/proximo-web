import ColorProvider from "lib/ColorProvider";
import { interfaceDesc, isNonEmptyString } from "lib/utils";
import CustomError from "lib/model/CustomError";
import { ILedger } from "lib/model/Ledger";
import { ITimeTable } from "lib/model/TimeTable";
import generateId from "lib/UUIDProvider";

const MODEL_TYPE_NAME = "IAccount";

export interface IAccount {
  _typeName: string;

  accountId: string;

  timetable: ITimeTable;
  ledger: ILedger;

  friendlyName: string;
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

  static createNew(colorProvider: ColorProvider): IAccount {
    return {
      _typeName: MODEL_TYPE_NAME,

      accountId: generateId(),

      timetable: null,
      ledger: null,

      friendlyName: null,
      dateCreated: new Date(),
      balance: NaN,
      colorCode: colorProvider.newColor()
    }
  }

  static isValid(account: IAccount) {
    if (account == null) {
      return false;
    }
    if (!("_typeName" in account)) {
      throw new CustomError("This object doesn't look like 'IAccount': " + interfaceDesc(account));
    }
    if (account._typeName !== MODEL_TYPE_NAME) {
      throw new CustomError("This object is not an 'IPostingSchedule': " + interfaceDesc(account));
    }
    if (typeof account.balance === 'string') {
      throw new CustomError("account.balance must be numeric");
    }
    return isNonEmptyString(account.accountId)
      && account.dateCreated != null
      && isNonEmptyString(account.colorCode)
      && account.colorCode.length == 6;
  }
}

export enum AccountHealth {
  Healthy,
  Warning,
  Danger
}
