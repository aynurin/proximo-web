import { IPostedTransaction } from "./PostedTransaction";

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
}
