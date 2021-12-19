import { I18N } from "aurelia-i18n";
import { DateFormat } from "lib/DateFormat";
import CustomError from "lib/model/CustomError";
import Person from "lib/model/Person";
import PostingSchedule, { IPostingSchedule } from "lib/model/PostingSchedule";

// Monthly, every {nthMonth:ordinal} month, on the {dateOfMonth:date}[, starting from {refDate:date}(this month)]
// Monthly, every {nthMonth:ordinal} month, on the {nthWeek:ordinal} {dayOfWeek:date} of the month[, starting from {refDate:date}(this month)]
// Weekly, every {nthWeek:ordinal} week, on {dayOfWeek:date}[, starting from {refDate:date}(this week)]
// Every year, on {monthAndDate: date}
// Once, on the {shortDate: date}

export class ScheduleRenderer {
  constructor(public readonly person: Person, private i18next: I18N, private readonly dateFormatter: DateFormat) {}
  
  renderLabel(schedule: IPostingSchedule): string {
    const postingSchedule = new PostingSchedule(schedule);
    const stringified = {
      nthMonth: this.shortOrdinal(postingSchedule.getNthMonth),  // 1-12
      nthWeek: this.shortOrdinal(postingSchedule.getNthWeek),    // 1-5
      dayOfWeek: this.fullDayOfWeek(postingSchedule.getDayOfWeek),
      dateOfMonth: this.shortDateOfMonth(postingSchedule.getDateOfMonth),
      monthAndDate: this.fullMonthAndDate(postingSchedule.getDateOfMonth, postingSchedule.getMonth),
      shortDate: this.shortDate(new Date(postingSchedule.getYear, postingSchedule.getMonth, postingSchedule.getDateOfMonth)),
      month: this.fullMonth(postingSchedule.getMonth),
      year: this.fullYear(postingSchedule.getYear),
      refDate: this.shortDate(postingSchedule.getRefDate),
    }
    return this.i18next.tr(schedule.label, stringified);
  }

  private shortOrdinal(n: number): string {
    if (n > 12) {
      throw new CustomError("Ordinals greater than 12 are not supported: " + n.toString());
    }
    return this.i18next.tr("schedule.label.ordinal." + n.toString());
  }

  private fullDayOfWeek(dayOfWeek: number) {
    const refDate = new Date();

    refDate.setDate(refDate.getDate() + dayOfWeek - refDate.getDay());

    return this.dateFormatter.toDayOfWeek(refDate);
  }

  private fullYear(year: number) {
    return this.dateFormatter.toParts(new Date(year, 0, 1)).find(p => p.type == "year").value;
  }

  private fullMonth(month: number) {
    return this.dateFormatter.toParts(new Date(2000, month-1, 1)).find(p => p.type == "month").value;
  }

  private shortDateOfMonth(dateOfMonth: number) {
    return this.dateFormatter.toParts(new Date(2000, 0, dateOfMonth)).find(p => p.type == "day").value;
  }

  private shortDate(date: Date) {
    return this.dateFormatter.toHumanReadableShort(date);
  }

  private fullMonthAndDate(dateOfMonth: number, month: number) {
    return this.dateFormatter.toDateOfMonth(new Date(2000, month-1, dateOfMonth));
  }
}

/*
Previous implementation: 

    const sched = this.tranwr.value.schedule;
    let label = cronstr(sched.cron);
    if (Schedule.allowsHolidayRule(sched)) {
      label += ", " + HolidayRule[sched.holidayRule] + " holidays";
    }
    if (sched.dateSince && sched.dateTill) {
      label +=
        ", between " +
        this.dateFormatter.toHumanReadableShort(sched.dateSince) +
        " and " +
        this.dateFormatter.toHumanReadableShort(sched.dateTill);
    } else if (sched.dateSince) {
      label +=
        ", starting from " + this.dateFormatter.toHumanReadableShort(sched.dateSince);
    } else if (sched.dateTill) {
      label += ", until " + this.dateFormatter.toHumanReadableShort(sched.dateTill);
    }
    return label;
*/
