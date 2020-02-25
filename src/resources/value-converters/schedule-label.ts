import * as moment from 'moment';
import { Schedule, HolidayRule } from 'model/schedule';
import cronstr from 'components/cronstr';

export class ScheduleLabelValueConverter {
  /*
    format can be:
      alone: 1st of the month
      when: The following transaction will run ...:
  */
  toView(sched: Schedule, format?: string) {
    if (!sched) return null;
    let label = cronstr(sched.cron);
    if (Schedule.allowsHolidayRule(sched)) {
      label += ", " + HolidayRule[sched.holidayRule] + " holidays";
    }
    if (sched.dateSince && sched.dateTill) {
      label +=
        ", between " +
        moment(sched.dateSince).format("MMMM Do YYYY") +
        " and " +
        moment(sched.dateTill).format("MMMM Do YYYY");
    } else if (sched.dateSince) {
      label +=
        ", starting from " + moment(sched.dateSince).format("MMMM Do YYYY");
    } else if (sched.dateTill) {
      label += ", until " + moment(sched.dateTill).format("MMMM Do YYYY");
    }
    return label;
  }
}
