import { IPostingSchedule } from './PostingSchedule';
import CustomError from "./CustomError";
import generateId from "./UUIDProvider";
import { interfaceString } from 'lib/utils';

const MODEL_TYPE_NAME = "IScheduledTransaction";

// ex. TranTemplate
export interface IScheduledTransaction {
  _typeName: string;

  scheduledId: string;

  schedule: IPostingSchedule;
  accountId: string;
  transferToAccountId: string;

  dateCreated: Date;
  amount: number;
  deviation?: number;
  description?: string;
}

export default class ScheduledTransaction {
  scheduledTransaction: IScheduledTransaction;

  constructor(scheduledTransaction: IScheduledTransaction) {
    this.scheduledTransaction = scheduledTransaction;
  }

  static createNew(accountId: string, schedule: IPostingSchedule): IScheduledTransaction {
    return {
      _typeName: MODEL_TYPE_NAME,
      scheduledId: generateId(),
      schedule: schedule,
      accountId: accountId,
      transferToAccountId: null,
      dateCreated: new Date(),
      amount: NaN
    }
  }

  static isValid(scheduled: IScheduledTransaction): boolean {
    if (scheduled == null) {
      return false;
    }
    if (!("_typeName" in scheduled)) {
      throw new CustomError("This object doesn't look like 'IScheduledTransaction': " + interfaceString(scheduled));
    }
    if (scheduled._typeName !== MODEL_TYPE_NAME) {
      throw new CustomError("This object is not an 'IScheduledTransaction': " + interfaceString(scheduled));
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
