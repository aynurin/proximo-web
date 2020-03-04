import {
  autoinject,
} from "aurelia-framework";
import cronstr from "../components/cronstr";
import * as moment from "moment";

import { Store, connectTo } from "aurelia-store";
import { State } from "../state";

import { HolidayRule, Schedule } from "../model/schedule";
import { TranTemplate } from "../model/tran-template";
import { TranStateActions } from "../model/tran-actions";

@autoinject()
@connectTo()
export class ScheduleGridCustomElement {
  public state: State;

  public constructor(private tranActions: TranStateActions) { }

  removeSchedule(tran: TranTemplate) {
    this.tranActions.removeSchedule(tran);
  }

  scheduleLabel(tran: TranTemplate): string {
    const sched = tran.selectedSchedule;
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
