import PostingSchedule, { IPostingSchedule } from './PostingSchedule';
import CustomError from "./CustomError";
import generateId from "lib/UUIDProvider";
import { interfaceDesc, isNonEmptyString } from 'lib/utils';

const MODEL_TYPE_NAME = "IScheduledTransaction";

// ex. IScheduledTransaction
export interface IScheduledTransaction {
  _typeName: string;
  _generation: number;

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
  static createNew(accountId: string, accountFriendlyName: string, schedule: IPostingSchedule): IScheduledTransaction {
    return {
      _typeName: MODEL_TYPE_NAME,
      _generation: 1,
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
    cloned.schedule = PostingSchedule.clone(other.schedule);
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
    if (!PostingSchedule.isValid(scheduled.schedule)) {
      return false;
    }
    if (!isNonEmptyString(scheduled.accountId)) {
      return false;
    }
    if (!isNonEmptyString(scheduled.accountFriendlyName)) {
      return false;
    }
    if (scheduled.transferToAccountId != null && !isNonEmptyString(scheduled.transferToAccountFriendlyName)) {
      return false;
    }
    if (scheduled.transferToAccountId === scheduled.accountId) {
      return false;
    }
    if (scheduled.amount == null || isNaN(scheduled.amount) || typeof scheduled.amount !== "number" || scheduled.amount == 0) {
      return false;
    }
    if (scheduled.description == null || scheduled.description.trim().length == 0) {
      return false;
    }
    if (scheduled._generation == null || typeof scheduled._generation != "number") {
      return false;
    }
    return true;
  }
}
