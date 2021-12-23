import ScheduledTransaction, { IScheduledTransaction } from 'lib/model/ScheduledTransaction';
import PostingSchedule, { IPostingSchedule } from 'lib/model/PostingSchedule';

const FAKE_UUID = '468a0887-ebbc-4bd3-9371-ef84d54b996f';

jest.mock('lib/UUIDProvider', () => ({
  __esModule: true,
  default: jest.fn(() => FAKE_UUID),
}));

describe('ScheduledTransaction', () => {
  let schedule: IPostingSchedule;
  let scheduled: IScheduledTransaction;

  beforeEach(() => {
    schedule = PostingSchedule.createNew().monthly(7);
    scheduled = ScheduledTransaction.createNew("account-x", "Account X", schedule);
    scheduled.amount = 3;
    scheduled.description = "test";
  })

  it('should create valid objects', () => {
    expect(ScheduledTransaction.isValid(scheduled)).toBe(true);
    expect(scheduled.scheduledId).toBe(FAKE_UUID);
  });

  it('should create valid objects', () => {
    scheduled.deviation = NaN;
    scheduled.transferToAccountId = "account-y";
    scheduled.transferToAccountFriendlyName = "Account Y";
    const cloned = ScheduledTransaction.clone(scheduled);

    expect(ScheduledTransaction.isValid(scheduled)).toBe(true);
    expect(ScheduledTransaction.isValid(cloned)).toBe(true);

    expect(PostingSchedule.isValid(scheduled.schedule)).toBe(true);
    expect(PostingSchedule.isValid(cloned.schedule)).toBe(true);
    expect(cloned).not.toBe(scheduled);
    expect(cloned.schedule).not.toBe(scheduled.schedule);
    expect(cloned.schedule).not.toBe(scheduled.schedule);

    expect(cloned.scheduledId).toEqual(scheduled.scheduledId);
    expect(cloned.dateCreated).toEqual(scheduled.dateCreated);
    expect(cloned.accountId).toEqual(scheduled.accountId);
    expect(cloned.accountFriendlyName).toEqual(scheduled.accountFriendlyName);
    expect(cloned.transferToAccountId).toEqual(scheduled.transferToAccountId);
    expect(cloned.transferToAccountFriendlyName).toEqual(scheduled.transferToAccountFriendlyName);
    expect(cloned.amount).toEqual(scheduled.amount);
    expect(cloned.deviation).toBeNaN();
    expect(cloned.description).toEqual(scheduled.description);
  });

  it('isValid shows invalid if null', () => {
    expect(ScheduledTransaction.isValid(null)).toBe(false);
  });

  it('isValid throws if concocted', () => {
    delete scheduled._typeName;
    expect(() => ScheduledTransaction.isValid(scheduled)).toThrow();
  });

  it('isValid throws if wrong type', () => {
    scheduled._typeName = "IWrongType";
    expect(() => ScheduledTransaction.isValid(scheduled)).toThrow();
  });

  it('isValid shows invalid if amount is null', () => {
    scheduled.amount = null;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if amount is not a number', () => {
    scheduled.amount = "strange amount" as unknown as number;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if amount is NaN', () => {
    scheduled.amount = NaN;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if amount is zero', () => {
    scheduled.amount = 0;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if schedule is null', () => {
    scheduled.schedule = null;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if accountIs is null', () => {
    scheduled.accountId = null;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if accountIs is empty', () => {
    scheduled.accountId = "  \r\n\t ";
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if transfer source and target accounts are the same', () => {
    scheduled.transferToAccountId = scheduled.accountId;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if description is null', () => {
    scheduled.description = null;
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });

  it('isValid shows invalid if description is empty', () => {
    scheduled.description = "  \r\n\t ";
    expect(ScheduledTransaction.isValid(scheduled)).toBe(false);
  });
});
