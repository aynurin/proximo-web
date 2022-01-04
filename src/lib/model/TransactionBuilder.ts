import { IChangeSet } from './ChangeSet';
import CustomError from './CustomError';
import Person from './Person';
import PostingSchedule, { HolidayRule, IPostingSchedule, ScheduleLabel } from "./PostingSchedule";
import ScheduledTransaction, { IScheduledTransaction } from "./ScheduledTransaction";

const MODEL_TYPE_NAME = "ITransactionBuilder";

export enum TransactionType {
  Deposit,
  Withdrawal,
  Transfer
}

export interface ITransactionBuilder {
  _typeName: string;
  original?: IScheduledTransaction;
  nthWeek?: number;
  nthMonth?: number;
  refDate?: Date;
  schedule?: IPostingSchedule;
  accountId?: string;
  accountIsNew?: boolean;
  accountFriendlyName?: string;
  /**
   * `true` if the user set the "Transfer" option for the transaction type
   * on the UI. So they either have to choose a "transfer to" account 
   * (set `transferToAccountId` to an existing account ID), or create a 
   * new account (specify `transferToAccountFriendlyName`)
   */
  transferToAccountRequired?: boolean;
  transferToAccountId?: string;
  transferToAccountIsNew?: boolean;
  transferToAccountFriendlyName?: string;
  amount?: number;
  deviation?: number;
  description?: string;
}

export default class TransactionBuilder {
  public readonly buffer: ITransactionBuilder;

  constructor(scheduled: IScheduledTransaction = null) {
    if (scheduled == null) {
      this.buffer = {
        _typeName: MODEL_TYPE_NAME,
      }
    } else {
      if (!ScheduledTransaction.isValid(scheduled)) {
        throw new CustomError("Can't modify a non-valid transaction", scheduled);
      }
      this.buffer = {
        _typeName: MODEL_TYPE_NAME,
        original: scheduled,
        refDate: new PostingSchedule(scheduled.schedule).getRefDate,
        schedule: PostingSchedule.clone(scheduled.schedule),
        accountId: scheduled.accountId,
        accountIsNew: false,
        accountFriendlyName: scheduled.accountFriendlyName,
        amount: scheduled.amount,
        deviation: scheduled.deviation,
        description: scheduled.description,
        transferToAccountRequired: false,
        transferToAccountIsNew: undefined,
        transferToAccountId: null,
        transferToAccountFriendlyName: null
      };
      if (scheduled.transferToAccountId != null) {
        this.buffer.transferToAccountRequired = true;
        this.buffer.transferToAccountId = scheduled.transferToAccountId;
        this.buffer.transferToAccountIsNew = false;
        this.buffer.transferToAccountFriendlyName = scheduled.transferToAccountFriendlyName;
      }
    }
  }

  get transactionType(): TransactionType {
    if (this.buffer.transferToAccountId != null || this.buffer.transferToAccountRequired === true) {
      return TransactionType.Transfer;
    } else if (this.buffer.amount > 0) {
      return TransactionType.Deposit;
    } else {
      return TransactionType.Withdrawal;
    }
  }

  set transactionType(type: TransactionType) {
    this.buffer.transferToAccountRequired = false;
    if (type == TransactionType.Deposit) {
      this.buffer.amount = Math.abs(this.buffer.amount);
    } else if (type == TransactionType.Withdrawal) {
      this.buffer.amount = -Math.abs(this.buffer.amount);
    } else if (type == TransactionType.Transfer) {
      this.buffer.transferToAccountRequired = true;
      this.buffer.amount = -Math.abs(this.buffer.amount);
    } else {
      throw new CustomError(`Unknown transaction type: ${type}`);
    }
  }

  get canBuild(): boolean {
    throw new Error("Method not implemented.");
  }

  build(): IChangeSet {
    throw new Error("Method not implemented.");
  }

  createPostingSchedule(): IPostingSchedule {
    if (!PostingSchedule.isValid(this.buffer.schedule)) {
      throw new CustomError("This posting schedule is not valid", this.buffer.schedule);
    }
    return this.buffer.schedule;
  }
  
}
