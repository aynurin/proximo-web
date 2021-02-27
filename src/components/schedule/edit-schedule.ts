import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import cronstr from "../cronstr";
import * as moment from "moment";

import { State } from "../../state";

import { Schedule, HolidayRule } from "../../model/schedule";
import { TranTemplate, TranScheduleWrapper } from "../../model/tran-template";
import { TranStateActions } from "../../model/tran-actions";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('edit-schedule');


@autoinject()
export class EditScheduleCustomElement {
  @bindable tranwr: TranScheduleWrapper<TranTemplate> = new TranScheduleWrapper(new TranTemplate());
  originalTran: TranTemplate = null;
  scheduleForm: HTMLFormElement;
  public state: State;

  public constructor(
    private dialogController: DialogController,
    private tranActions: TranStateActions, 
    private ea: EventAggregator) { }

  activate(tran: TranTemplate) {
    this.originalTran = tran;
    this.tranwr = new TranScheduleWrapper(Object.assign({}, tran));
    this.tranwr.value.selectedSchedule = Object.assign({}, this.tranwr.value.selectedSchedule);
  }

  async cancelForm() {
    log.debug('cancelForm');
    await this.dialogController.cancel();
  }

  async saveSchedule() {
    log.debug('saveSchedule');
    if (this.canSave) {
      await this.tranActions.replaceSchedule(this.originalTran, this.tranwr.value);
      this.ea.publish('schedule-changed');
      await this.dialogController.ok();
      this.tranwr = new TranScheduleWrapper(new TranTemplate());
    }
  }

  scheduleMatcher(a: Schedule, b: Schedule) {
    return Schedule.equals(a, b);
  }

  @computedFrom("tranwr.value.selectedSchedule.dateSince")
  get minDateTill(): string {
    return moment(this.tranwr.value.selectedSchedule.dateSince).format("YYYY-MM-DD");
  }

  @computedFrom("tranwr.value.selectedSchedule")
  get showHolidayRule(): boolean {
    return (
      this.tranwr && this.tranwr.value &&
      Schedule.allowsHolidayRule(this.tranwr.value.selectedSchedule)
    );
  }

  @computedFrom("tranwr.value.selectedSchedule")
  get showDateRange(): boolean {
    return (
      this.tranwr && this.tranwr.value &&
      Schedule.allowsDateRange(this.tranwr.value.selectedSchedule)
    );
  }

  @computedFrom("tranwr.value.date")
  get allOptions(): Schedule[] {
    const date = moment(this.tranwr.value.date);
    const options: Schedule[] = [];

    if (this.tranwr.value.date == null || this.tranwr.value.date == "") {
      return options;
    }

    options.push(
      new Schedule(date, "Every " + moment(date).format("dddd"), {
        dayOfWeek: date.day()
      })
    );

    options.push(
      new Schedule(date, "Monthly, on the " + moment(date).format("Do"), {
        day: date.date()
      })
    );

    options.push(
      new Schedule(date, "Once a year, on " + moment(date).format("MMM Do"), {
        day: date.date(),
        month: date.month() + 1
      })
    );

    options.push(
      new Schedule(date, "Once, on " + moment(date).format("MMM Do YYYY"), {
        day: date.date(),
        month: date.month() + 1,
        year: date.year()
      })
    );

    return options;
  }

  @computedFrom("tranwr.isValid")
  get canSave(): boolean {
    return this.tranwr && this.tranwr.isValid;
  }

  @computedFrom("tranwr.value.selectedSchedule")
  get scheduleLabel(): string {
    const sched = this.tranwr.value.selectedSchedule;
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
