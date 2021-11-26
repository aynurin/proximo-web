import { Schedule, HolidayRule } from 'model/schedule';
import { DateFormat } from 'components/date-format';
import cronstr from 'components/cronstr';

export class ScheduleLabelValueConverter {
  private dateFormatter = new DateFormat();
  /*
    format can be:
      alone: 1st of the month
      when: The following transaction will run ...:
  */
  toView(sched: Schedule, format?: string) {
    if (!sched) return null;
    let label = cronstr(sched.cron);
    if (Schedule.allowsHolidayRule(sched) && sched.holidayRule > 0) {
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
  }
}
