import PostingSchedule, { HolidayRule, IPostingSchedule, ScheduleLabel } from "lib/model/PostingSchedule";

describe('PostingSchedule', () => {
  const refDate: Date = new Date(2021, 12, 15);

  beforeAll(() => {
    expect.extend({
      toBeAProperSchedule: validateSchedule
    });
  });

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
  it('should clone properly with options', () => {
    const schedule = PostingSchedule.createNew().monthly(1);
    schedule.options = {
      dateSinceIncl: new Date(),
      dateTillIncl: new Date(),
      holidayRule: HolidayRule.before
    }
    const cloned = PostingSchedule.clone(schedule);
    
    expect(cloned).not.toBe(schedule);
    expect(cloned.schedule).not.toBe(schedule.schedule);
    expect(cloned.schedule).toEqual(schedule.schedule);
    expect(cloned.label).toEqual(schedule.label);
    expect(cloned.options).not.toBe(schedule.options);
    expect(cloned.options.dateSinceIncl).toEqual(schedule.options.dateSinceIncl);
    expect(cloned.options.dateTillIncl).toEqual(schedule.options.dateTillIncl);
    expect(cloned.options.holidayRule).toEqual(schedule.options.holidayRule);
  });
  it('should clone properly with no options', () => {
    const schedule = PostingSchedule.createNew().monthly(1);
    const cloned = PostingSchedule.clone(schedule);
    
    expect(cloned).not.toBe(schedule);
    expect(cloned.schedule).toEqual(schedule.schedule);
    expect(cloned.label).toEqual(schedule.label);
  });

  it('should throw if constructed with invalid data', () => {
    expect(() => new PostingSchedule(null)).toThrow();
  });
  it('should report null as invalid', () => {
    expect(PostingSchedule.isValid(null)).toBe(false);
  });
  it('should throw on concocted objects', () => {
    const schedule = PostingSchedule.createNew().postingSchedule;
    delete schedule._typeName;
    expect(() => PostingSchedule.isValid(schedule)).toThrow();
  });
  it('should throw on other types of objects', () => {
    const schedule = PostingSchedule.createNew().postingSchedule;
    schedule._typeName = "IWrongTypeName";
    expect(() => PostingSchedule.isValid(schedule)).toThrow();
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
    expect(s).toBeAProperSchedule();
  });
  it('can create nthMonth schedules', () => {
    const s = PostingSchedule.createNew().nthMonth(4, 13, refDate);
    expect(s.label).toBe(ScheduleLabel.nthMonth);
    expect(s).toBeAProperSchedule();
  });
  it('can create secondMonth schedules', () => {
    const s = PostingSchedule.createNew().secondMonth(13, refDate);
    expect(s.label).toBe(ScheduleLabel.secondMonth);
    expect(s).toBeAProperSchedule();
  });
  it('can create thirdMonth schedules', () => {
    const s = PostingSchedule.createNew().thirdMonth(13, refDate);
    expect(s.label).toBe(ScheduleLabel.thirdMonth);
    expect(s).toBeAProperSchedule();
  });

  it('can create weekly schedules', () => {
    const s = PostingSchedule.createNew().weekly(5);
    expect(s.label).toBe(ScheduleLabel.weekly);
    expect(s).toBeAProperSchedule();
  });
  it('can create nthWeek schedules', () => {
    const s = PostingSchedule.createNew().nthWeek(4, 5, refDate);
    expect(s.label).toBe(ScheduleLabel.nthWeek);
    expect(s).toBeAProperSchedule();
  });
  it('can create secondWeek schedules', () => {
    const s = PostingSchedule.createNew().secondWeek(5, refDate);
    expect(s.label).toBe(ScheduleLabel.secondWeek);
    expect(s).toBeAProperSchedule();
  });
  it('can create thirdWeek schedules', () => {
    const s = PostingSchedule.createNew().thirdWeek(5, refDate);
    expect(s.label).toBe(ScheduleLabel.thirdWeek);
    expect(s).toBeAProperSchedule();
  });

  it('can create nthMonthNthWeek schedules', () => {
    const s = PostingSchedule.createNew().nthMonthNthWeek(5, 3, 2, refDate);
    expect(s.label).toBe(ScheduleLabel.nthMonthNthWeek);
    expect(s).toBeAProperSchedule();
  });

  it('can create annuall schedules', () => {
    const s = PostingSchedule.createNew().annually(11, 15);
    expect(s.label).toBe(ScheduleLabel.everyYear);
    expect(s).toBeAProperSchedule();
  });


  it('can create once schedules', () => {
    const s = PostingSchedule.createNew().once(11, 15, 2021);
    expect(s.label).toBe(ScheduleLabel.once);
    expect(s).toBeAProperSchedule();
  });
});


/**
 * This is supposed to be a custom jest matcher, but I couldn't figure out how to expect.extend - getting a "expect is undefined"
 * @param received IPostingSchedule to be validated
 * @returns `true` if IPostingSchedule is valid, otherwise `string[]` listing all identified issues
 */
 function validateSchedule(received: IPostingSchedule) {
  const p = new PostingSchedule(received);
  const msg: string[] = [];
  if (p.postingSchedule.schedule.length !== 7) {
    msg.push(`Expected to have 7 parts of the schedule, got ${p.postingSchedule.schedule.length}: ` + p.postingSchedule.schedule.join(','));
  } else {
    switch (received.label) {
      case ScheduleLabel.monthly:
        if (p.getDateOfMonth == null || isNaN(p.getDateOfMonth)) {
          msg.push(`Expected ${received.label} to specify date of month, but it doesn't`);
        }
        break;

      case ScheduleLabel.nthMonth:
        if (p.getDateOfMonth == null || isNaN(p.getDateOfMonth)) {
          msg.push(`Expected ${received.label} to specify date of month, but it doesn't`);
        }
        if (p.getNthMonth == null || isNaN(p.getNthMonth)) {
          msg.push(`Expected ${received.label} to specify Nth month, but it doesn't`);
        } else if (p.getNthMonth <= 3) {
          let suggest = p.getNthMonth == 1 ? "monthly" : p.getNthMonth == 2 ? "secondMonth" : "thirdMonth";
          msg.push(`Expected ${received.label} to specify Nth month >= 4, but got ${p.getNthMonth}, try using ${suggest} instead`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.secondMonth:
        if (p.getDateOfMonth == null || isNaN(p.getDateOfMonth)) {
          msg.push(`Expected ${received.label} to specify date of month, but it doesn't`);
        }
        if (p.getNthMonth == null || isNaN(p.getNthMonth)) {
          msg.push(`Expected ${received.label} to specify Nth month, but it doesn't`);
        } else if (p.getNthMonth != 2) {
          msg.push(`Expected ${received.label} to specify Nth month = 2, but it specifies ${p.getNthMonth}`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.thirdMonth:
        if (p.getDateOfMonth == null || isNaN(p.getDateOfMonth)) {
          msg.push(`Expected ${received.label} to specify date of month, but it doesn't`);
        }
        if (p.getNthMonth == null || isNaN(p.getNthMonth)) {
          msg.push(`Expected ${received.label} to specify Nth month, but it doesn't`);
        } else if (p.getNthMonth != 3) {
          msg.push(`Expected ${received.label} to specify Nth month = 3, but it specifies ${p.getNthMonth}`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.weekly:
        if (p.getDayOfWeek == null || isNaN(p.getDayOfWeek)) {
          msg.push(`Expected ${received.label} to specify day of week, but it doesn't`);
        }
        break;

      case ScheduleLabel.nthWeek:
        if (p.getDayOfWeek == null || isNaN(p.getDayOfWeek)) {
          msg.push(`Expected ${received.label} to specify day of week, but it doesn't`);
        }
        if (p.getNthWeek == null || isNaN(p.getNthWeek)) {
          msg.push(`Expected ${received.label} to specify Nth week, but it doesn't`);
        } else if (p.getNthWeek < 4) {
          let suggest = p.getNthWeek == 1 ? "weekly" : p.getNthWeek == 2 ? "secondWeek" : "thirdWeek";
          msg.push(`Expected ${received.label} to specify Nth week >= 4, but it specifies ${p.getNthWeek}. Use ${suggest} instead.`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.secondWeek:
        if (p.getDayOfWeek == null || isNaN(p.getDayOfWeek)) {
          msg.push(`Expected ${received.label} to specify day of week, but it doesn't`);
        }
        if (p.getNthWeek == null || isNaN(p.getNthWeek)) {
          msg.push(`Expected ${received.label} to specify Nth week, but it doesn't`);
        } else if (p.getNthWeek != 2) {
          msg.push(`Expected ${received.label} to specify Nth week = 2, but it specifies ${p.getNthWeek}`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.thirdWeek:
        if (p.getDayOfWeek == null || isNaN(p.getDayOfWeek)) {
          msg.push(`Expected ${received.label} to specify day of week, but it doesn't`);
        }
        if (p.getNthWeek == null || isNaN(p.getNthWeek)) {
          msg.push(`Expected ${received.label} to specify Nth week, but it doesn't`);
        } else if (p.getNthWeek != 3) {
          msg.push(`Expected ${received.label} to specify Nth week = 3, but it specifies ${p.getNthWeek}`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.nthMonthNthWeek:
        if (p.getNthMonth == null || isNaN(p.getNthMonth)) {
          msg.push(`Expected ${received.label} to specify Nth month, but it doesn't`);
        }
        if (p.getDayOfWeek == null || isNaN(p.getDayOfWeek)) {
          msg.push(`Expected ${received.label} to specify day of week, but it doesn't`);
        }
        if (p.getNthWeek == null || isNaN(p.getNthWeek)) {
          msg.push(`Expected ${received.label} to specify Nth week, but it doesn't`);
        } else if (p.getNthWeek > 5) {
          msg.push(`Expected ${received.label} to specify Nth week < 5, but it specifies ${p.getNthWeek}`);
        }
        if (p.getRefDate == null) {
          msg.push(`Expected ${received.label} to specify ref date, but it doesn't`);
        }
        break;

      case ScheduleLabel.everyYear:
        if (p.getMonth == null || isNaN(p.getMonth)) {
          msg.push(`Expected ${received.label} to specify month, but it doesn't`);
        }
        if (p.getDateOfMonth == null || isNaN(p.getDateOfMonth)) {
          msg.push(`Expected ${received.label} to specify date of month, but it doesn't`);
        }
        break;

      case ScheduleLabel.once:
        if (p.getYear == null || isNaN(p.getYear)) {
          msg.push(`Expected ${received.label} to specify year, but it doesn't`);
        }
        if (p.getMonth == null || isNaN(p.getMonth)) {
          msg.push(`Expected ${received.label} to specify month, but it doesn't`);
        }
        if (p.getDateOfMonth == null || isNaN(p.getDateOfMonth)) {
          msg.push(`Expected ${received.label} to specify date of month, but it doesn't`);
        }
        break;

      default:
        break;
    }
  }
  return {
    pass: msg.length === 0,
    message: () => msg.join('. ')
  };
}
