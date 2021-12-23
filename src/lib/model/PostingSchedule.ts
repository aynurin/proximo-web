import { interfaceDesc, isNonEmptyString } from "lib/utils";
import CustomError from "./CustomError";

const MODEL_TYPE_NAME = "IPostingSchedule";

export interface IPostingSchedule {
  _typeName: string;

  schedule: number[];
  label: ScheduleLabel;

  options?: IPostingScheduleOptions;
}

export interface IPostingScheduleOptions {
  holidayRule?: HolidayRule;
  dateSinceIncl?: Date;
  dateTillIncl?: Date;
}

export enum HolidayRule {
  on = "on",
  before = "before",
  after = "after"
}

// See lib/view/ScheduleRenderer for possible schedule options

export default class PostingSchedule {
  public readonly postingSchedule: IPostingSchedule;

  constructor(postingSchedule: IPostingSchedule) {
    if (!PostingSchedule.isValid(postingSchedule)) {
      throw new CustomError("This object is not a valid IPostingSchedule" + interfaceDesc(postingSchedule));
    }
    this.postingSchedule = postingSchedule;
  }

  static createNew(): PostingSchedule {
    return new PostingSchedule({
      _typeName: MODEL_TYPE_NAME,
      schedule: null,
      label: null
    });
  }

  static clone(other: IPostingSchedule): IPostingSchedule {
    const clone = Object.assign({}, other);
    clone.schedule = [...other.schedule];
    clone.options = other.options ? Object.assign({}, other.options) : null;
    return clone;
  }

  static isValid(postingSchedule: IPostingSchedule): boolean {
    if (postingSchedule == null) {
      return false;
    }
    if (!("_typeName" in postingSchedule)) {
      throw new CustomError("This object doesn't look like 'IPostingSchedule': " + interfaceDesc(postingSchedule));
    }
    if (postingSchedule._typeName !== MODEL_TYPE_NAME) {
      throw new CustomError("This object is not an 'IPostingSchedule': " + interfaceDesc(postingSchedule));
    }
    return (postingSchedule.label == null || Object.values(ScheduleLabel).includes(postingSchedule.label))
      && (postingSchedule.schedule == null || postingSchedule.schedule.length === 7);
  }

  static allowsDateRange(scheduleLabel: string): boolean {
    return scheduleLabel != ScheduleLabel.once;
  }

  static allowsHolidayRule(scheduleLabel: string): boolean {
    return scheduleLabel != ScheduleLabel.weekly
      && scheduleLabel != ScheduleLabel.secondWeek
      && scheduleLabel != ScheduleLabel.thirdWeek
      && scheduleLabel != ScheduleLabel.nthWeek;
  }

  /**
   * Modifies the current instance and returns its data
   * @param dateOfMonth Date on which to post the transaction
   * @returns Resulting schedule data
   */
  monthly(dateOfMonth: number) {
    return this.set({ dateOfMonth }, ScheduleLabel.monthly);
  }

  /**
   * Modifies the current instance and returns its data
   * @param nthMonth Specify on which every Nth month to post this transaction
   * @param dateOfMonth On which date of Nth month
   * @param refDate Date to calculate nth month from
   * @returns Resulting schedule data
   */
  nthMonth(nthMonth: number, dateOfMonth: number, refDate: Date) {
    return this.set({ nthMonth, dateOfMonth, refDate }, ScheduleLabel.nthMonth);
  }

  secondMonth(dateOfMonth: number, refDate: Date) {
    return this.set({ nthMonth: 2, dateOfMonth, refDate }, ScheduleLabel.secondMonth);
  }

  thirdMonth(dateOfMonth: number, refDate: Date) {
    return this.set({ nthMonth: 3, dateOfMonth, refDate }, ScheduleLabel.thirdMonth);
  }

  weekly(dayOfWeek: number) {
    return this.set({ dayOfWeek }, ScheduleLabel.weekly);
  }

  nthWeek(nthWeek: number, dayOfWeek: number, refDate: Date) {
    return this.set({ nthWeek, dayOfWeek, refDate }, ScheduleLabel.nthWeek);
  }

  secondWeek(dayOfWeek: number, refDate: Date) {
    return this.set({ nthWeek: 2, dayOfWeek, refDate }, ScheduleLabel.secondWeek);
  }

  thirdWeek(dayOfWeek: number, refDate: Date) {
    return this.set({ nthWeek: 3, dayOfWeek, refDate }, ScheduleLabel.thirdWeek);
  }

  nthMonthNthWeek(nthMonth: number, nthWeek: number, dayOfWeek: number, refDate: Date) {
    return this.set({ nthMonth, nthWeek, dayOfWeek, refDate }, ScheduleLabel.nthMonthNthWeek);
  }

  annually(month: number, dateOfMonth: number) {
    return this.set({ dateOfMonth, month }, ScheduleLabel.everyYear);
  }

  once(month: number, dateOfMonth: number, year: number) {
    return this.set({ dateOfMonth, month, year }, ScheduleLabel.once);
  }

  fromLabel(scheduleLabel: ScheduleLabel, refDate: Date, nthWeek: number, nthMonth: number): IPostingSchedule {
    return this.set({
      nthMonth: nthMonth,
      nthWeek: nthWeek,
      dayOfWeek: refDate.getDay(),
      dateOfMonth: refDate.getDate(),
      month: refDate.getMonth(),
      year: refDate.getFullYear(),
      refDate: refDate
    }, scheduleLabel);
  }

  private set(schedule: { nthMonth?: number, nthWeek?: number, dayOfWeek?: number, dateOfMonth?: number, month?: number, year?: number, refDate?: Date },
    label: ScheduleLabel): IPostingSchedule {
    this.postingSchedule.label = label;
    this.postingSchedule.schedule = [
      schedule.nthMonth ?? NaN,
      schedule.nthWeek ?? NaN,
      schedule.dayOfWeek ?? NaN,
      schedule.dateOfMonth ?? NaN,
      schedule.month ?? NaN,
      schedule.year ?? NaN,
      schedule.refDate?.valueOf()
    ];
    return this.postingSchedule;
  }

  get getNthMonth(): number { return this.postingSchedule.schedule[0]; }
  get getNthWeek(): number { return this.postingSchedule.schedule[1]; }
  get getDayOfWeek(): number { return this.postingSchedule.schedule[2]; }
  get getDateOfMonth(): number { return this.postingSchedule.schedule[3]; }
  get getMonth(): number { return this.postingSchedule.schedule[4]; }
  get getYear(): number { return this.postingSchedule.schedule[5]; }
  get getRefDate(): Date {
    return isNaN(this.postingSchedule.schedule[6])
      || this.postingSchedule.schedule[6] == 0
      ? null
      : new Date(this.postingSchedule.schedule[6]);
  }
}

/**
 * @todo: Twice Monthly
 */
export enum ScheduleLabel {
  monthly = "schedule.label.monthly",
  nthMonth = "schedule.label.nthmonth",
  secondMonth = "schedule.label.secondmonth",
  thirdMonth = "schedule.label.thirdmonth",
  weekly = "schedule.label.weekly",
  nthWeek = "schedule.label.nthweek",
  secondWeek = "schedule.label.secondweek",
  thirdWeek = "schedule.label.thirdweek",
  nthMonthNthWeek = "schedule.label.nthmonthnthweek",
  everyYear = "schedule.label.everyyear",
  once = "schedule.label.once",
}
