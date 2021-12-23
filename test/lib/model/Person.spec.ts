import PostingSchedule from 'lib/model/PostingSchedule';
import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";
import Person, { IPerson } from "lib/model/Person";
import ScheduledTransaction from "lib/model/ScheduledTransaction";
import { IPostedTransaction } from 'lib/model/PostedTransaction';
    

const FAKE_COLOR = "fkeclr";

jest.mock("lib/ColorProvider");
jest.mock('lib/UUIDProvider');

describe('Person', () => {
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

  const person1 : IPerson = {
    personId: "1",
    accounts: null,
    introSteps: null
  };

  const colorProvider = new ColorProvider({ personId: person1.personId, accounts: null, introSteps: null });

  const account1 = Account.createNew(colorProvider);
  account1.friendlyName = "Account 1";
  account1.timetable = {
    timetable: [
      ScheduledTransaction.createNew(account1.accountId, account1.friendlyName, PostingSchedule.createNew().monthly(4))
    ],
    dateLastChanged: new Date()
  }

  const account2 = Account.createNew(colorProvider);
  account2.friendlyName = "Account 2";

  const account3 = Account.createNew(colorProvider);
  account3.friendlyName = "Account 3";
  account3.ledger = {
      transactions: [
        Object.assign({}, transactionTemplate, { transactionId: "1", amount: 10, accountBalance: 100, datePosted: new Date(2021, 11, 15)}),
        Object.assign({}, transactionTemplate, { transactionId: "2", amount: 20, accountBalance: 80, datePosted: new Date(2021, 11, 15)}),
        Object.assign({}, transactionTemplate, { transactionId: "3", amount: 30, accountBalance: 50, datePosted: new Date(2021, 11, 16)}),
        Object.assign({}, transactionTemplate, { transactionId: "4", amount: 40, accountBalance: 10, datePosted: new Date(2021, 11, 17)}),
        Object.assign({}, transactionTemplate, { transactionId: "5", amount: 50, accountBalance: -40, datePosted: new Date(2021, 11, 17)})],
      dateUpdated: new Date()
    };

  person1.accounts = [account1, account2, account3];

  const p = new Person(person1);

  it('chose a color for the account', () => {
    expect(p.person.accounts[0].colorCode).toBe(FAKE_COLOR);
    expect(p.person.accounts[1].colorCode).toBe(FAKE_COLOR);
    expect(p.person.accounts[2].colorCode).toBe(FAKE_COLOR);
  })

  it('should show if it has any schedules', () => {
    expect(p.hasSchedules()).toBe(true);
  });

  it('should show if it has any ledgers', () => {
    expect(p.hasLedgers()).toBe(true);
  });

  it('can find an account', () => {
    expect(p.getAccount(account2.accountId).friendlyName).toBe(account2.friendlyName);
  });

  it('throws if constructed with a null', () => {
    expect(() => new Person(null)).toThrow();
  });

  it('getAccount is predictable when no accounts', () => {
    const tmpacc = p.person.accounts;
    p.person.accounts = [];
    expect(p.getAccount(tmpacc[0].accountId)).toBeNull();
    p.person.accounts = tmpacc;
  });

  it('should shallow clone', () => {
    const cloned = Person.cloneState(p.person);

    expect(cloned).not.toBe(p.person);
    expect(cloned.accounts[0]).toBe(p.person.accounts[0]);
  });
});
