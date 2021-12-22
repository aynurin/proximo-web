import { IPostedTransaction, TransactionsPostedOnDate, TransactionState } from "lib/model/PostedTransaction";

describe('PostedTransaction', () => {
  const postedTemplate: IPostedTransaction = {
    transactionId: null,
  
    accountId: null,
    scheduledId: null,
    originalScheduleLabel: "string",
    transferToAccountId: null,
  
    dateGenerated: new Date(),
    datePosted: new Date(),
    amount: 1,
    accountBalance: 100,
    state: TransactionState.Executed,
  };

  const ta = [
    Object.assign({}, postedTemplate, { transactionId: "1", accountId: "1", amount: 10, accountBalance: 110, datePosted: new Date(2021, 11, 10) }),
    Object.assign({}, postedTemplate, { transactionId: "2", accountId: "1", amount: -15, accountBalance: 95, datePosted: new Date(2021, 11, 11) }),
    Object.assign({}, postedTemplate, { transactionId: "3", accountId: "1", amount: 20, accountBalance: 115, datePosted: new Date(2021, 11, 12) }),
    Object.assign({}, postedTemplate, { transactionId: "4", accountId: "1", amount: -25, accountBalance: 90, datePosted: new Date(2021, 11, 13) }),
    Object.assign({}, postedTemplate, { transactionId: "5", accountId: "1", amount: 30, accountBalance: 120, datePosted: new Date(2021, 11, 14) }),
  ];

  const tb = [
    Object.assign({}, postedTemplate, { transactionId: "10", accountId: "10", amount: -50, accountBalance: 0, datePosted: new Date(2021, 11, 10) }),
    Object.assign({}, postedTemplate, { transactionId: "20", accountId: "10", amount: 40, accountBalance: 40, datePosted: new Date(2021, 11, 11) }),
    Object.assign({}, postedTemplate, { transactionId: "30", accountId: "10", amount: -30, accountBalance: 115, datePosted: new Date(2021, 11, 12) }),
    Object.assign({}, postedTemplate, { transactionId: "40", accountId: "10", amount: 20, accountBalance: 90, datePosted: new Date(2021, 11, 13) }),
    Object.assign({}, postedTemplate, { transactionId: "50", accountId: "10", amount: -10, accountBalance: 120, datePosted: new Date(2021, 11, 14) }),
  ];

  let datebucket: TransactionsPostedOnDate;

  beforeEach(() => {
    datebucket = new TransactionsPostedOnDate(ta[0].datePosted, ta[0]);
  })

  it('does not allow account collisions', () => {
    expect(() => datebucket.add(tb[0])).toThrow();
  });

  it('updates on add', () => {
    datebucket.add(ta[1]);

    expect(datebucket.all).toHaveLength(2);

    expect(datebucket.first).toBe(ta[0]);
    expect(datebucket.last).toBe(ta[1]);

    expect(datebucket.high).toHaveLength(1);
    expect(datebucket.high[0]).toBe(ta[0]);
    expect(datebucket.low).toHaveLength(1);
    expect(datebucket.low[0]).toBe(ta[1]);

    expect(datebucket.totalSpend).toBe(ta[1].amount);
    expect(datebucket.totalIncome).toBe(ta[0].amount);
  });

  it('can be combined with another', () => {
    datebucket.add(ta[1]);

    const anotherbucket =  new TransactionsPostedOnDate(ta[0].datePosted, ta[2]);
    anotherbucket.add(ta[3]);
    anotherbucket.add(ta[4]);

    const newbucket = TransactionsPostedOnDate.combine([datebucket, anotherbucket]);

    expect(newbucket.all).toHaveLength(5);

    expect(newbucket.first).toBe(ta[0]);
    expect(newbucket.last).toBe(ta[4]);

    expect(newbucket.high).toHaveLength(1);
    expect(newbucket.high[0]).toBe(ta[4]);
    expect(newbucket.low).toHaveLength(1);
    expect(newbucket.low[0]).toBe(ta[3]);

    expect(newbucket.totalSpend).toBe(-40);
    expect(newbucket.totalIncome).toBe(60);
  });

  it('cannot be combined with another account', () => {
    const anotherbucket =  new TransactionsPostedOnDate(tb[0].datePosted, tb[1]);
    expect(() => TransactionsPostedOnDate.combine([datebucket, anotherbucket])).toThrow();
  });

  it('cannot be combined with another date', () => {
    const anotherbucket =  new TransactionsPostedOnDate(ta[2].datePosted, ta[2]);
    expect(() => TransactionsPostedOnDate.combine([datebucket, anotherbucket])).toThrow();
  });
});
