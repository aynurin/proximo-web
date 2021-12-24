import PostingSchedule, { ScheduleLabel } from "lib/model/PostingSchedule";
import ScheduledTransaction, { IScheduledTransaction } from "lib/model/ScheduledTransaction";
import TransactionBuilder, { TransactionType } from "lib/model/TransactionBuilder";

describe('TransactionBuilder', () => {

  let scheduled: IScheduledTransaction;

  beforeEach(() => {
    scheduled = ScheduledTransaction.createNew("a", "A", PostingSchedule.createNew().weekly(3));
    scheduled.amount = 4;
    scheduled.description = "test";
  });

  it('should create an empty buffer if no scheduled transaction provided to edit', () => {
    let builder = new TransactionBuilder(null);
    expect(builder.buffer._typeName).toBe("ITransactionBuilder");
    expect(Object.keys(builder.buffer)).toHaveLength(1);
  });

  it('should throw if scheduled is not valid (but not null)', () => {
    scheduled.schedule = null;
    expect(() => new TransactionBuilder(scheduled)).toThrow();
  });

  it('should start with the given transaction if one given', () => {
    let builder = new TransactionBuilder(scheduled);

    expect(builder.buffer._typeName).toBe("ITransactionBuilder");
    expect(builder.buffer.original).toBe(scheduled);
    expect(builder.buffer.schedule).not.toBe(scheduled.schedule);
    expect(builder.buffer.schedule.label).toBe(scheduled.schedule.label);
    expect(builder.buffer.accountId).toBe(scheduled.accountId);
    expect(builder.buffer.accountIsNew).toBe(false);
    expect(builder.buffer.accountFriendlyName).toBe(scheduled.accountFriendlyName);
    expect(builder.buffer.amount).toBe(scheduled.amount);
    expect(builder.buffer.description).toBe(scheduled.description);
    expect(builder.buffer.transferToAccountRequired).toBe(false);
    expect(builder.buffer.transferToAccountId).toBeNull();
    expect(builder.buffer.transferToAccountFriendlyName).toBeNull();
    expect(builder.buffer.transferToAccountIsNew).toBeUndefined();
  });

  it('should start with the given transaction if one given', () => {
    scheduled.transferToAccountId = "b";
    scheduled.transferToAccountFriendlyName = "B";
    let builder = new TransactionBuilder(scheduled);

    expect(builder.buffer.transferToAccountRequired).toBe(true);
    expect(builder.buffer.transferToAccountId).toBe(scheduled.transferToAccountId);
    expect(builder.buffer.transferToAccountFriendlyName).toBe(scheduled.transferToAccountFriendlyName);
  });

  it('should change attributes when the transactionType is set to Deposit', () => {
    let builder = new TransactionBuilder(scheduled);
    builder.transactionType = TransactionType.Deposit;

    expect(builder.buffer.amount).toBeGreaterThan(0);
    expect(builder.buffer.transferToAccountRequired).toBe(false);
  });

  it('should change attributes when the transactionType is set to Withdrawal', () => {
    let builder = new TransactionBuilder(scheduled);
    builder.transactionType = TransactionType.Withdrawal;

    expect(builder.buffer.amount).toBeLessThan(0);
    expect(builder.buffer.transferToAccountRequired).toBe(false);
  });

  it('should change attributes when the transactionType is set to Transfer', () => {
    let builder = new TransactionBuilder(scheduled);
    builder.transactionType = TransactionType.Transfer;

    expect(builder.buffer.amount).toBeLessThan(0);
    expect(builder.buffer.transferToAccountRequired).toBe(true);
  });

  it('should change attributes when the transactionType is set to unknown', () => {
    let builder = new TransactionBuilder(scheduled);

    expect(() =>
      builder.transactionType = "wrong value" as unknown as TransactionType)
      .toThrow();
  });

  it('should change transactionType to Deposit based on attributes', () => {
    let builder = new TransactionBuilder(scheduled);
    builder.buffer.amount = 10;
    builder.buffer.transferToAccountRequired = true;

    builder.transactionType = TransactionType.Withdrawal;

    expect(builder.buffer.amount).toBeLessThan(0);

    builder.buffer.amount = 10;

    expect(builder.transactionType).toBe(TransactionType.Deposit);
    expect(builder.buffer.transferToAccountRequired).toBe(false);
  });

  it('should change transactionType to Withdrawal based on attributes', () => {
    let builder = new TransactionBuilder(scheduled);
    builder.buffer.amount = -10;
    builder.buffer.transferToAccountRequired = true;

    builder.transactionType = TransactionType.Deposit;

    expect(builder.buffer.amount).toBeGreaterThan(0);

    builder.buffer.amount = -10;

    expect(builder.transactionType).toBe(TransactionType.Withdrawal);
    expect(builder.buffer.transferToAccountRequired).toBe(false);
  });

  it('should change transactionType to Transfer based on attributes', () => {
    let builder = new TransactionBuilder(scheduled);
    builder.buffer.amount = -10;
    builder.buffer.transferToAccountRequired = true;

    builder.transactionType = TransactionType.Deposit;

    expect(builder.buffer.amount).toBeGreaterThan(0);
    expect(builder.buffer.transferToAccountRequired).toBe(false);

    builder.buffer.amount = -10;
    builder.buffer.transferToAccountRequired = true;

    expect(builder.transactionType).toBe(TransactionType.Transfer);
    expect(builder.buffer.transferToAccountRequired).toBe(true);
  });

  it('should implement canBuild', () => {
    let builder = new TransactionBuilder(scheduled);
    expect(() => builder.canBuild).toThrow();
  });

  it('should implement build', () => {
    let builder = new TransactionBuilder(scheduled);
    expect(() => builder.build()).toThrow();
  });

  it('should create PostingSchedule', () => {
    let builder = new TransactionBuilder(scheduled);
    const schedule = builder.createPostingSchedule();

    expect(schedule.label).toBe(ScheduleLabel.weekly);
    expect(new PostingSchedule(schedule).getDayOfWeek)
      .toBe(3);
  });
});
