import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import cronstr from "../cronstr";
import * as moment from "moment";

import { Store, connectTo } from "aurelia-store";
import { State } from "../../state";

import { Schedule, HolidayRule } from "../../model/schedule";
import { TranTemplate } from "../../model/tran-template";
import { TranStateActions } from "../../model/tran-actions";
import { DialogController } from 'aurelia-dialog';

@autoinject()
@connectTo()
export class DeleteScheduleCustomElement {
  @bindable tran: TranTemplate;
  scheduleForm: HTMLFormElement;
  public state: State;

  public constructor(
    private dialogController: DialogController,
    private tranActions: TranStateActions, 
    private ea: EventAggregator) {
  }

  activate(tran: TranTemplate) {
    this.tran = tran;
  }

  async cancelForm() {
    await this.dialogController.cancel();
  }

  async deleteSchedule() {
    await this.tranActions.removeSchedule(this.tran);
    this.ea.publish('schedule-changed');
    await this.dialogController.ok();
  }

  @computedFrom("cron")
  get scheduleLabel(): string {
    const sched = this.tran.selectedSchedule;
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
