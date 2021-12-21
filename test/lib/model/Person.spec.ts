import PostingSchedule from 'lib/model/PostingSchedule';
import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";
import Person, { IPerson } from "lib/model/Person";
import ScheduledTransaction from "lib/model/ScheduledTransaction";
import { IPostedTransaction } from 'lib/model/PostedTransaction';
    
const FAKE_COLOR = "fkecde";
const FAKE_UUIDS = [
  '468a0887-ebbc-4bd3-9371-ef84d54b996f',
  '02ec369e-a597-4cc6-8586-8ff1d8a80fab',
  'e357b036-5718-4886-9015-60d8ed61b3db',
  'c3bf6353-5082-45f3-a786-e3c82345aa64',
];
let fakeUUIDNbr = 0;

jest.mock('lib/model/UUIDProvider', () => ({
  __esModule: true,
  default: jest.fn(() => FAKE_UUIDS[fakeUUIDNbr++]),
}));

jest.mock("lib/ColorProvider");

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
  const newColorFn = jest.fn(() => FAKE_COLOR);
  colorProvider.newColor = newColorFn;

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

  it('should show if it has any schedules', () => {
    expect(p.hasSchedules()).toBe(true);
  });

  it('should show if it has any ledgers', () => {
    expect(p.hasLedgers()).toBe(true);
  });

  it('can find an account', () => {
    expect(p.getAccount(account2.accountId).friendlyName).toBe(account2.friendlyName);
  });
});
