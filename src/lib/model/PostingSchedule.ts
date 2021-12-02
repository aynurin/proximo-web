import { interfaceString, isNonEmptyString } from "lib/utils";
import CustomError from "./CustomError";
import generateId from "./UUIDProvider";

const MODEL_TYPE_NAME = "IPostingSchedule";

export interface IPostingSchedule {
  _typeName: string;

  scheduleId: string;
  accountId: string;

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

// Monthly, every {nthMonth} month, on the {dateOfMonth}[, starting from {refDate}(this month)]
// Monthly, every {nthMonth} month, on the {nthWeek} {dayOfWeek} of the month[, starting from {refDate}(this month)]
// Weekly, every {nthWeek} week, on {dayOfWeek}[, starting from {refDate}(this week)]
// Every year, on {month} {dateOfMonth}
// Once, on the {dateOfMonth} of {month}, {year}

// not clear how I am going to construct and use this... Need to try.
export default class PostingSchedule {
  public readonly postingSchedule: IPostingSchedule;

  constructor(postingSchedule: IPostingSchedule) {
    if (!PostingSchedule.isValid(postingSchedule)) {
      throw new CustomError("This object is not a valid IPostingSchedule" + interfaceString(postingSchedule));
    }
    this.postingSchedule = postingSchedule;
  }

  static createNew(accountId: string): PostingSchedule {
    return new PostingSchedule({
      _typeName: MODEL_TYPE_NAME,
      scheduleId: generateId(),
      accountId: accountId,
      schedule: null,
      label: null
    });
  }

  static isValid(postingSchedule: IPostingSchedule): boolean {
    if (postingSchedule == null) {
      return false;
    }
    if (!("_typeName" in postingSchedule)) {
      throw new CustomError("This object doesn't look like 'IPostingSchedule': " + interfaceString(postingSchedule));
    }
    if (postingSchedule._typeName !== MODEL_TYPE_NAME) {
      throw new CustomError("This object is not an 'IPostingSchedule': " + interfaceString(postingSchedule));
    }
    return postingSchedule.label in ScheduleLabel
      && isNonEmptyString(postingSchedule.scheduleId)
      && isNonEmptyString(postingSchedule.accountId)
      && postingSchedule.schedule != null
      && postingSchedule.schedule.length === 7;
  }

  monthly(dateOfMonth: number) {
    this.set({ dateOfMonth }, ScheduleLabel.monthly);
  }

  nthMonth(nthMonth: number, dateOfMonth: number, refDate: Date) {
    this.set({ nthMonth, dateOfMonth, refDate }, ScheduleLabel.nthMonth);
  }

  secondMonth(dateOfMonth: number, refDate: Date) {
    this.set({ nthMonth: 2, dateOfMonth, refDate }, ScheduleLabel.secondMonth);
  }

  thirdMonth(dateOfMonth: number, refDate: Date) {
    this.set({ nthMonth: 3, dateOfMonth, refDate }, ScheduleLabel.thirdMonth);
  }

  weekly(dayOfWeek: number) {
    this.set({ dayOfWeek }, ScheduleLabel.weekly);
  }

  nthWeek(nthWeek: number, dayOfWeek: number, refDate: Date) {
    this.set({ nthWeek, dayOfWeek, refDate }, ScheduleLabel.nthWeek);
  }

  secondWeek(dateOfMonth: number, refDate: Date) {
    this.set({ nthWeek: 2, dateOfMonth, refDate }, ScheduleLabel.secondWeek);
  }

  thirdWeek(dateOfMonth: number, refDate: Date) {
    this.set({ nthWeek: 3, dateOfMonth, refDate }, ScheduleLabel.thirdWeek);
  }

  nthMonthNthWeek(nthMonth: number, dateOfMonth: number, nthWeek: number, dayOfWeek: number, refDate: Date) {
    this.set({ nthMonth, dateOfMonth, nthWeek, dayOfWeek, refDate }, ScheduleLabel.nthMonthNthWeek);
  }

  annually(month: number, dateOfMonth: number) {
    this.set({ dateOfMonth, month }, ScheduleLabel.everyYear);
  }

  once(month: number, dateOfMonth: number, year: number) {
    this.set({ dateOfMonth, month, year }, ScheduleLabel.once);
  }

  private set(schedule: {nthMonth?: number, nthWeek?: number, dayOfWeek?: number, dateOfMonth?: number, month?: number, year?: number, refDate?: Date},
      label: ScheduleLabel) {
    this.postingSchedule.label = label;
    this.postingSchedule.schedule = [
      schedule.nthMonth ?? 0,
      schedule.nthWeek ?? 0,
      schedule.dayOfWeek ?? 0,
      schedule.dateOfMonth ?? 0,
      schedule.month ?? 0,
      schedule.year ?? 0,
      schedule.refDate.valueOf()
    ];
  }

  get getNthMonth(): number { return this.postingSchedule.schedule[0]; }
  get getNthWeek(): number { return this.postingSchedule.schedule[1]; }
  get getDayOfWeek(): number { return this.postingSchedule.schedule[2]; }
  get getDateOfMonth(): number { return this.postingSchedule.schedule[3]; }
  get getMonth(): number { return this.postingSchedule.schedule[4]; }
  get getYear(): number { return this.postingSchedule.schedule[5]; }
  get getRefDate(): Date { return new Date(this.postingSchedule.schedule[6]); }
}

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
