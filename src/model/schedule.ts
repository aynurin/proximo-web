
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('schedule');

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

  compareTo(other: Schedule): number {
    const thisExpr = this.cron.join(' ');
    const otherExpr = other.cron.join(' ');
    return thisExpr.localeCompare(otherExpr);
  }

  static allowsHolidayRule(s: Schedule): boolean {
    return s && s.cron && isCronAny(s.cron[2]);
  }

  static allowsDateRange(s: Schedule): boolean {
    return s && s.cron && !(!isCronAny(s.cron[0]) && !isCronAny(s.cron[1]) && !isCronAny(s.cron[3]))
  }

  static equals(one: Schedule, other: Schedule): boolean {
    const equals =
      one.cron[0] == other.cron[0] &&
      one.cron[1] == other.cron[1] &&
      one.cron[2] == other.cron[2] &&
      one.cron[3] == other.cron[3];
    return equals;
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
