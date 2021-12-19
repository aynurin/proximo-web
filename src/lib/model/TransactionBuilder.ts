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
  refDate?: Date;
  nthWeek?: number;
  nthMonth?: number;
  scheduleLabel?: ScheduleLabel;
  holidayRule?: HolidayRule;
  dateSinceIncl?: Date;
  dateTillIncl?: Date;
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

  constructor(scheduled: IScheduledTransaction = null, person: Person) {
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
        scheduleLabel: scheduled.schedule.label,
        holidayRule: scheduled.schedule.options?.holidayRule,
        dateSinceIncl: scheduled.schedule.options?.dateSinceIncl,
        dateTillIncl: scheduled.schedule.options?.dateTillIncl,
        accountId: scheduled.accountId,
        accountIsNew: false,
        accountFriendlyName: person.getAccount(scheduled.accountId).friendlyName,
        amount: scheduled.amount,
        deviation: scheduled.deviation,
        description: scheduled.description,
      };
      if (scheduled.transferToAccountId != null) {
        this.buffer.transferToAccountRequired = true;
        this.buffer.transferToAccountId = scheduled.transferToAccountId;
        this.buffer.transferToAccountIsNew = false;
        this.buffer.transferToAccountFriendlyName = person.getAccount(scheduled.transferToAccountId).friendlyName;
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
      this.buffer.amount = 0;
    }
  }

  get canBuild(): boolean {
    throw new Error("Method not implemented.");
  }

  build(): IChangeSet {
    throw new Error("Method not implemented.");
  }

  createPostingSchedule(): IPostingSchedule {
    return PostingSchedule.createNew().fromLabel(this.buffer.scheduleLabel, this.buffer.refDate, this.buffer.nthWeek, this.buffer.nthMonth);
  }
  
}
