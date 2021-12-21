import { OrderedAggregate } from "lib/model/Aggregate";
import CustomError from "lib/model/CustomError";

// ex. TranGenerated
export interface IPostedTransaction {
  transactionId: string;

  accountId: string;
  scheduledId: string;
  originalScheduleLabel: string;
  transferToAccountId: string;

  dateGenerated: Date;
  datePosted: Date;
  amount: number;
  accountBalance: number;
  state: TransactionState;

  ledgerOrder?: number;
  description?: string;
}

export enum TransactionState {
  Planned = 0,
  Processing = 1,
  Executed = 2,
  Deleted = 3
}

export default class PostedTransaction {
  postedTransaction: IPostedTransaction;

  constructor(postedTransaction: IPostedTransaction) {
    this.postedTransaction = postedTransaction;
  }
}

export class TransactionsPostedOnDate implements OrderedAggregate<Date, IPostedTransaction, number> {
  key: Date;
  first: IPostedTransaction;
  last: IPostedTransaction;
  low: IPostedTransaction[];
  high: IPostedTransaction[];
  totals: number[];
  all: IPostedTransaction[];

  constructor(date: Date, firstTransaction: IPostedTransaction) {
    this.key = date;
    this.first = firstTransaction;
    this.last = firstTransaction;
    this.high = [firstTransaction];
    this.low = [firstTransaction];
    this.totals = firstTransaction.amount > 0 ? [0, firstTransaction.amount] : [firstTransaction.amount, 0];
    this.all = [firstTransaction];
  }

  add(transaction: IPostedTransaction) {
    if (transaction.accountId != this.first.accountId) {
      throw new CustomError(`This transaction is from a different account: ${transaction.accountId} (expexted ${this.first.accountId})`);
    }
    this.last = transaction;
    if (transaction.accountBalance < this.low[0].accountBalance) {
      this.low.push(transaction);
    }
    if (transaction.accountBalance < this.high[0].accountBalance) {
      this.high.push(transaction);
    }
    if (transaction.amount > 0) {
      this.totals[1] += transaction.amount;
    } else {
      this.totals[0] += transaction.amount;
    }
    this.all.push(transaction);
  }

  static combine(segments: TransactionsPostedOnDate[]): TransactionsPostedOnDate {
    const sameKey = segments.every((value: TransactionsPostedOnDate, index: number, array: TransactionsPostedOnDate[]) => index === 0 || value.key == array[index-1].key);
    if (!sameKey) {
      throw new CustomError("TransactionsPostedOnDate.combine can only merge segments with the same key. Provided keys: " + segments.map(t => t.key.toISOString()).join(", "))
    }
    const key = segments[0].key;
    return segments.reduce((accumulator: TransactionsPostedOnDate, current: TransactionsPostedOnDate) => {
      if (accumulator.first == null || accumulator.first.datePosted > current.first.datePosted) {
        accumulator.first = current.first;
      }
      if (accumulator.last == null || accumulator.last.datePosted < current.last.datePosted) {
        accumulator.last = current.last;
      }
      if (accumulator.high.length == 0 || accumulator.high[0].amount < current.high[0].amount) {
        accumulator.high = current.high;
      } else if (accumulator.high[0].amount == current.high[0].amount) {
        accumulator.high = [...accumulator.high, ...current.high];
        accumulator.high.sort((a,b) => a.datePosted.valueOf() - b.datePosted.valueOf());
      }
      if (accumulator.low.length == 0 || accumulator.low[0].amount > current.low[0].amount) {
        accumulator.low = current.low;
      } else if (accumulator.low[0].amount == current.low[0].amount) {
        accumulator.low = [...accumulator.low, ...current.low];
        accumulator.low.sort((a,b) => a.datePosted.valueOf() - b.datePosted.valueOf());
      }
      accumulator.totals[0] += current.totals[0];
      accumulator.totals[1] += current.totals[1];
      return accumulator;
    }, new TransactionsPostedOnDate(key, null));
  }
}

export type MapOfTransactionsPostedOnDate = Map<Date, TransactionsPostedOnDate>;
