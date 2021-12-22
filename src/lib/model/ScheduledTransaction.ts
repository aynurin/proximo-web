import { IPostingSchedule } from './PostingSchedule';
import CustomError from "./CustomError";
import generateId from "lib/UUIDProvider";
import { interfaceDesc } from 'lib/utils';

const MODEL_TYPE_NAME = "IScheduledTransaction";

// ex. IScheduledTransaction
export interface IScheduledTransaction {
  _typeName: string;

  scheduledId: string;
  dateCreated: Date;

  schedule: IPostingSchedule;
  accountId: string;
  accountFriendlyName: string;
  transferToAccountId: string;
  transferToAccountFriendlyName: string;

  amount: number;
  deviation?: number;
  description?: string;
}

export default class ScheduledTransaction {
  scheduledTransaction: IScheduledTransaction;

  constructor(scheduledTransaction: IScheduledTransaction) {
    this.scheduledTransaction = scheduledTransaction;
  }

  static createNew(accountId: string, accountFriendlyName: string, schedule: IPostingSchedule): IScheduledTransaction {
    return {
      _typeName: MODEL_TYPE_NAME,
      scheduledId: generateId(),
      schedule,
      accountId,
      accountFriendlyName,
      transferToAccountId: null,
      transferToAccountFriendlyName: null,
      dateCreated: new Date(),
      amount: NaN
    }
  }

  static clone(other: IScheduledTransaction): IScheduledTransaction {
    const cloned = Object.assign({}, other);
    cloned.schedule = Object.assign({}, other.schedule);
    cloned.schedule.options = Object.assign({}, other.schedule.options);
    return cloned;
  }

  static isValid(scheduled: IScheduledTransaction): boolean {
    if (scheduled == null) {
      return false;
    }
    if (!("_typeName" in scheduled)) {
      throw new CustomError("This object doesn't look like 'IScheduledTransaction': " + interfaceDesc(scheduled));
    }
    if (scheduled._typeName !== MODEL_TYPE_NAME) {
      throw new CustomError("This object is not an 'IScheduledTransaction': " + interfaceDesc(scheduled));
    }
    if (scheduled.schedule == null) {
      return false;
    }
    if (scheduled.amount == null || isNaN(scheduled.amount) || typeof scheduled.amount !== "number" || scheduled.amount == 0) {
      return false;
    }
    if (scheduled.accountId == null || scheduled.accountId.trim().length == 0) {
      return false;
    }
    if (scheduled.transferToAccountId === scheduled.accountId) {
      return false;
    }
    if (scheduled.description == null || scheduled.description.trim().length == 0) {
      return false;
    }
    return true;
  }
}
