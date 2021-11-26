import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import cronstr from "../cronstr";
import { DateFormat } from "components/date-format";

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
  private dateFormatter = new DateFormat();

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
