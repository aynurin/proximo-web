
// ex. TranGenerated
export interface IPostedTransaction {
  transactionId: string;

  accountId: string;
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
