import PostingSchedule, { ScheduleLabel, validateSchedule } from "lib/model/PostingSchedule";

describe('PostingSchedule', () => {
  const refDate: Date = new Date(2021, 12, 15);

  it('should create valid objects', () => {
    expect(
      PostingSchedule.isValid(
        PostingSchedule.createNew().postingSchedule))
      .toBe(true);
  });
  it('should create valid objects with schedule', () => {
    expect(
      PostingSchedule.isValid(
        PostingSchedule.createNew().monthly(1)))
      .toBe(true);
  });
  it('weekly should not allow holiday rules', () => {
    expect(
      PostingSchedule.allowsHolidayRule(
        PostingSchedule.createNew().weekly(2).label))
      .toBe(false);
  });
  it('weekly should allow date range', () => {
    expect(
      PostingSchedule.allowsDateRange(
        PostingSchedule.createNew().weekly(2).label))
      .toBe(true);
  });
  it('monthly should allow holiday rules', () => {
    expect(
      PostingSchedule.allowsHolidayRule(
        PostingSchedule.createNew().monthly(2).label))
      .toBe(true);
  });
  it('once should not allow date range', () => {
    expect(
      PostingSchedule.allowsDateRange(
        PostingSchedule.createNew().once(11, 15, 2022).label))
      .toBe(false);
  });


  it('can create monthly schedules', () => {
    const s = PostingSchedule.createNew().monthly(13);
    expect(s.label).toBe(ScheduleLabel.monthly);
    expect(validateSchedule(s)).toBe(true);
  });
  it('can create nthMonth schedules', () => {
    const s = PostingSchedule.createNew().nthMonth(4, 13, refDate);
    expect(s.label).toBe(ScheduleLabel.nthMonth);
    expect(validateSchedule(s)).toBe(true);
  });
  it('can create secondMonth schedules', () => {
    const s = PostingSchedule.createNew().secondMonth(13, refDate);
    expect(s.label).toBe(ScheduleLabel.secondMonth);
    expect(validateSchedule(s)).toBe(true);
  });
  it('can create thirdMonth schedules', () => {
    const s = PostingSchedule.createNew().thirdMonth(13, refDate);
    expect(s.label).toBe(ScheduleLabel.thirdMonth);
    expect(validateSchedule(s)).toBe(true);
  });


  it('can create weekly schedules', () => {
    const s = PostingSchedule.createNew().weekly(5);
    expect(s.label).toBe(ScheduleLabel.weekly);
    expect(validateSchedule(s)).toBe(true);
  });
  it('can create nthWeek schedules', () => {
    const s = PostingSchedule.createNew().nthWeek(4, 5, refDate);
    expect(s.label).toBe(ScheduleLabel.nthWeek);
    expect(validateSchedule(s)).toBe(true);
  });
  it('can create secondWeek schedules', () => {
    const s = PostingSchedule.createNew().secondWeek(5, refDate);
    expect(s.label).toBe(ScheduleLabel.secondWeek);
    expect(validateSchedule(s)).toBe(true);
  });
  it('can create thirdWeek schedules', () => {
    const s = PostingSchedule.createNew().thirdWeek(5, refDate);
    expect(s.label).toBe(ScheduleLabel.thirdWeek);
    expect(validateSchedule(s)).toBe(true);
  });


  it('can create annuall schedules', () => {
    const s = PostingSchedule.createNew().annually(11, 15);
    expect(s.label).toBe(ScheduleLabel.everyYear);
    expect(validateSchedule(s)).toBe(true);
  });


  it('can create once schedules', () => {
    const s = PostingSchedule.createNew().once(11, 15, 2021);
    expect(s.label).toBe(ScheduleLabel.once);
    expect(validateSchedule(s)).toBe(true);
  });
});
