import { IScheduledTransaction } from 'lib/model/ScheduledTransaction';

export interface IStateChangeSet {
  newTransaction: IScheduledTransaction;
}
