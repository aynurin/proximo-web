import { computedFrom } from "aurelia-framework";

export interface CronParts {
  day?: number;
  month?: number;
  dayOfWeek?: number;
  year?: number;
  nthDayOfWeek?: number;
}

export class Schedule {
  cron: string[];
  label: string;
  // allowHolidayRule: boolean;
  holidayRule: HolidayRule = HolidayRule.on;
  dateSince: string;
  dateTill: string;

  get allowsHolidayRule(): boolean {
    return this.cron && isCronAny(this.cron[2]);
  }

  get allowsDateRange(): boolean {
    return this.cron && !(!isCronAny(this.cron[0]) && !isCronAny(this.cron[1]) && !isCronAny(this.cron[3]))
  }

  constructor(label: string, cron: CronParts) {
    this.cron = [
      cron.day == null || cron.day === NaN ? "*" : cron.day.toString(),
      cron.month == null || cron.month === NaN ? "*" : cron.month.toString(),
      cron.dayOfWeek == null || cron.dayOfWeek === NaN
        ? "*"
        : cron.nthDayOfWeek == null || cron.nthDayOfWeek === NaN
        ? cron.dayOfWeek.toString()
        : `${cron.dayOfWeek}#${cron.nthDayOfWeek}`,
      cron.year == null || cron.year === NaN ? "*" : cron.year.toString()
    ];
    this.label = label;
    // this.allowHolidayRule = allowHolidayRule;
  }

  compareTo(other: Schedule) {
    const thisExpr = this.cron.join(' ');
    const otherExpr = other.cron.join(' ');
    return thisExpr.localeCompare(otherExpr);
  }
}

export enum HolidayRule {
  on,
  before,
  after
}

function isCronAny(str: string): boolean {
  return str == null || str === '*' || str === '?';
}