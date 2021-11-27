import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import cronstr from "lib/cronstr";
import { DateFormat } from "lib/date-format";

import { State } from "lib/state";

import { Schedule, HolidayRule } from "lib/model/schedule";
import { TranTemplate, TranScheduleWrapper } from "lib/model/tran-template";
import { TranStateActions } from "lib/model/tran-actions";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('edit-schedule');


@autoinject()
export class EditScheduleCustomElement {
  @bindable tranwr: TranScheduleWrapper<TranTemplate> = new TranScheduleWrapper(new TranTemplate());
  originalTran: TranTemplate = null;
  scheduleForm: HTMLFormElement;
  public state: State;
  private dateFormatter = new DateFormat();

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
    return this.dateFormatter.toISODate(this.tranwr.value.selectedSchedule.dateSince);
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
    const date = this.tranwr.value.date;
    const options: Schedule[] = [];

    if (this.tranwr.value.date == null) {
      return options;
    }

    options.push(
      new Schedule(date, "Every " + this.dateFormatter.toDayOfWeek(date), {
        dayOfWeek: date.getDay()
      })
    );

    options.push(
      new Schedule(date, "Monthly, on the " + this.dateFormatter.toDate(date), {
        day: date.getDate()
      })
    );

    options.push(
      new Schedule(date, "Once a year, on " + this.dateFormatter.toDateOfMonth(date), {
        day: date.getDate(),
        month: date.getMonth() + 1
      })
    );

    options.push(
      new Schedule(date, "Once, on " + this.dateFormatter.toHumanReadableShort(date), {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
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
