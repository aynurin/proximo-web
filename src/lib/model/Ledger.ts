import { IPostedTransaction, MapOfTransactionsPostedOnDate, TransactionsPostedOnDate } from "./PostedTransaction";

export interface ILedger {
  ledgerId: string;
  accountId: string;
  transactions: IPostedTransaction[];
  dateUpdated: Date;
}

export default class Ledger {
  ledger: ILedger;

  constructor(ledger: ILedger) {
    this.ledger = ledger;
  }

  static cloneState(oldState: ILedger): ILedger {
    return Object.assign({}, oldState);
  }

  groupByDate(keyConverter: (transaction: IPostedTransaction) => Date = null): MapOfTransactionsPostedOnDate {
    return this.ledger.transactions.reduce<MapOfTransactionsPostedOnDate>(
      (accumulator: MapOfTransactionsPostedOnDate, current: IPostedTransaction): MapOfTransactionsPostedOnDate => {
        const key = keyConverter == null ? current.datePosted : keyConverter(current);
        if (accumulator.has(key)) {
          accumulator.get(key).add(current);
        } else {
          accumulator.set(key, new TransactionsPostedOnDate(key, current));
        }
        return accumulator;
      }, new Map<Date, TransactionsPostedOnDate>());
  }
}
