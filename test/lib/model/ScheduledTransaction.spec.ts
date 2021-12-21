import ScheduledTransaction from 'lib/model/ScheduledTransaction';
import PostingSchedule from 'lib/model/PostingSchedule';

const FAKE_UUID = '468a0887-ebbc-4bd3-9371-ef84d54b996f';

jest.mock('lib/model/UUIDProvider', () => ({
  __esModule: true,
  default: jest.fn(() => FAKE_UUID),
}));

describe('ScheduledTransaction', () => {
  it('should create valid objects', () => {
    const schedule = PostingSchedule.createNew().monthly(7);
    const scheduled = ScheduledTransaction.createNew("account-x", "Account X", schedule);
    scheduled.amount = 3;
    scheduled.description = "test";

    expect(ScheduledTransaction.isValid(scheduled)).toBe(true);
    expect(scheduled.scheduledId).toBe(FAKE_UUID);
  });
});
