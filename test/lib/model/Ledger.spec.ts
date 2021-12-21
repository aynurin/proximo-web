import Ledger, { ILedger } from 'lib/model/Ledger';
import { IPostedTransaction } from 'lib/model/PostedTransaction';

// return this.ledger.transactions.reduce<MapOfTransactionsPostedOnDate>(
//   (accumulator: MapOfTransactionsPostedOnDate, current: IPostedTransaction): MapOfTransactionsPostedOnDate => {
//     const key = keyConverter == null ? current.datePosted : keyConverter(current);
//     if (accumulator.has(key)) {
//       accumulator.get(key).add(current);
//     } else {
//       accumulator.set(key, new TransactionsPostedOnDate(key, current));
//     }
//     return accumulator;
//   }, new Map<Date, TransactionsPostedOnDate>());
    
describe('Ledger', () => {
  const transactionTemplate : IPostedTransaction = {
    transactionId: null,
    accountId: null,
    scheduledId: null,
    originalScheduleLabel: null,
    transferToAccountId: null,
    dateGenerated: null,
    datePosted: null,
    amount: null,
    accountBalance: null,
    state: null,
  };
  const ledgerTemplate: ILedger = {
    dateUpdated: null,
    transactions: null
  }
  it('should group by date', () => {
    const transactions = [
      Object.assign({}, transactionTemplate, { transactionId: "1", amount: 10, accountBalance: 100, datePosted: new Date(2021, 11, 15)}),
      Object.assign({}, transactionTemplate, { transactionId: "2", amount: 20, accountBalance: 80, datePosted: new Date(2021, 11, 15)}),
      Object.assign({}, transactionTemplate, { transactionId: "3", amount: 30, accountBalance: 50, datePosted: new Date(2021, 11, 16)}),
      Object.assign({}, transactionTemplate, { transactionId: "4", amount: 40, accountBalance: 10, datePosted: new Date(2021, 11, 17)}),
      Object.assign({}, transactionTemplate, { transactionId: "5", amount: 50, accountBalance: -40, datePosted: new Date(2021, 11, 17)})];
    const ledger = new Ledger(Object.assign({}, ledgerTemplate, { transactions }));
    const dateMap = ledger.groupByDate();

    expect(dateMap.size).toBe(3);
    expect(dateMap.get(new Date(2021, 11, 15).valueOf()).all.length).toBe(2);
    expect(dateMap.get(new Date(2021, 11, 16).valueOf()).all.length).toBe(1);
    expect(dateMap.get(new Date(2021, 11, 17).valueOf()).all.length).toBe(2);

    expect(dateMap.get(new Date(2021, 11, 17).valueOf()).low[0].transactionId).toBe("5");
    expect(dateMap.get(new Date(2021, 11, 17).valueOf()).high[0].transactionId).toBe("4");
  });
});
