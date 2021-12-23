import PostingSchedule from "lib/model/PostingSchedule";
import ScheduledTransaction, { IScheduledTransaction } from "lib/model/ScheduledTransaction";
import TimeTable, { ITimeTable } from "lib/model/TimeTable";

describe('TimeTable', () => {

  const timetable : ITimeTable = {
    timetable: [
      ScheduledTransaction.createNew("a", "Acc A", PostingSchedule.createNew().weekly(2)),
      ScheduledTransaction.createNew("a", "Acc A", PostingSchedule.createNew().weekly(3)),
      ScheduledTransaction.createNew("a", "Acc A", PostingSchedule.createNew().weekly(4))
    ],
    dateLastChanged: new Date()
  };

  it('should allow finding scheduled transactions by Id', () => {
    const scheduled = new TimeTable(timetable).getScheduled(timetable.timetable[0].scheduledId);
    expect(scheduled).toBe(timetable.timetable[0]);
  });

  it('should shallow clone', () => {
    const cloned = TimeTable.cloneState(timetable);

    expect(cloned).not.toBe(timetable);
    expect(cloned.timetable[0]).toBe(timetable.timetable[0]);
  });
});
