import { OrderedAggregate } from "./Aggregate";
import CustomError from "./CustomError";

// ex. TranGenerated
/**
 * @todo Create a ScheduledTransaction method that generates a PostedTransaction based on ScheduledTransaction
 */
export interface IPostedTransaction {
  transactionId: string;

  accountId: string;
  scheduledId: string;
  originalScheduleLabel: string;
  transferToAccountId: string;

  dateGenerated: Date;
  datePosted: Date;
  amount: number;
  /**
   * Account balance *after* applying this transaction
   */
  accountBalance: number;
  /**
   * Transaction state, possible values are `Planned`, `Processing`, 
   * `Executed`, `Deleted`.
   * Basically this is a convenience property, to show if the *today* account 
   * balance is impacted by this transaction or not. This has relation to 
   * `datePosted` - if the `state` is `Planned` then `datePosted` cannot be in the past
   */
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

export class TransactionsPostedOnDate implements OrderedAggregate<Date, IPostedTransaction> {
  key: Date;
  first: IPostedTransaction;
  last: IPostedTransaction;
  /**
   * Transactions resulting in the lowest account balance for this date key.
   */
  low: IPostedTransaction[] = [];
  /**
   * Transactions resulting in the lowest account balance for this date key.
   */
  high: IPostedTransaction[] = [];
  all: IPostedTransaction[] = [];

  totalIncome = 0;
  totalSpend = 0;

  constructor(dateKey: Date, firstTransaction: IPostedTransaction) {
    this.key = dateKey;
    if (firstTransaction !== null) {
      this.first = firstTransaction;
      this.last = firstTransaction;
      this.high = [firstTransaction];
      this.low = [firstTransaction];
      if (firstTransaction.amount > 0) {
        this.totalIncome = firstTransaction.amount;
      } else {
        this.totalSpend = firstTransaction.amount;
      }
      this.all = [firstTransaction];   
    }
  }

  /**
   * This will add the transaction to this bucket without testing 
   * if it belongs to the `key` or not. 
   * You need to sort all properties after adding if you expect to be
   * adding in an order other than ascending by datePosted.
   * @param transaction Transaction to add to this key
   */
  add(transaction: IPostedTransaction) {
    if (this.first != null && transaction.accountId != this.first.accountId) {
      throw new CustomError(`This transaction is from a different account: ${transaction.accountId} (expexted ${this.first.accountId})`);
    }

    if (this.first == null || transaction.datePosted < this.first.datePosted) {
      this.first = transaction;
    }
    if (this.last == null || transaction.datePosted > this.last.datePosted) {
      this.last = transaction;
    }

    if (this.low.length == 0 || transaction.accountBalance < this.low[0].accountBalance) {
      this.low = [transaction];
    } else if (transaction.accountBalance == this.low[0].accountBalance) {
      this.low.push(transaction);
    }
    if (this.high.length == 0 || transaction.accountBalance > this.high[0].accountBalance) {
      this.high = [transaction];
    } else if (transaction.accountBalance == this.high[0].accountBalance) {
      this.high.push(transaction);
    }

    if (transaction.amount > 0) {
      this.totalIncome += transaction.amount;
    } else {
      this.totalSpend += transaction.amount;
    }

    this.all.push(transaction);
  }

  static combine(segments: TransactionsPostedOnDate[]): TransactionsPostedOnDate {
    const sameKey = segments.every(
      (value, index, array) => index === 0 || 
        (value.key === array[index-1].key 
          && value.first.accountId == array[index-1].first.accountId));
    if (!sameKey) {
      throw new CustomError("TransactionsPostedOnDate.combine can only merge segments with the same key. Provided keys: " + segments.map(t => t.key).join(", "))
    }

    const key = segments[0].key;

    const combined = segments.reduce((combined, current) => {
      if (combined.first == null || combined.first.datePosted > current.first.datePosted) {
        combined.first = current.first;
      }
      if (combined.last == null || combined.last.datePosted < current.last.datePosted) {
        combined.last = current.last;
      }

      if (combined.high.length == 0 || combined.high[0].accountBalance < current.high[0].accountBalance) {
        combined.high = current.high;
      } else if (combined.high[0].amount == current.high[0].amount) {
        combined.high = [...combined.high, ...current.high];
      }
      if (combined.low.length == 0 || combined.low[0].accountBalance > current.low[0].accountBalance) {
        combined.low = current.low;
      } else if (combined.low[0].accountBalance == current.low[0].accountBalance) {
        combined.low = [...combined.low, ...current.low];
      }

      combined.all = [...combined.all, ...current.all];

      combined.totalIncome += current.totalIncome;
      combined.totalSpend += current.totalSpend;

      return combined;
    }, new TransactionsPostedOnDate(key, null));
    
    combined.high.sort((a,b) => a.datePosted.valueOf() - b.datePosted.valueOf());
    combined.low.sort((a,b) => a.datePosted.valueOf() - b.datePosted.valueOf());
    combined.all.sort((a,b) => a.datePosted.valueOf() - b.datePosted.valueOf());
    return combined;
  }
}

export type MapOfTransactionsPostedOnDate = Map<number, TransactionsPostedOnDate>;
