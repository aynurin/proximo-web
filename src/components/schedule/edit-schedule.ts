import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import cronstr from "../cronstr";
import * as moment from "moment";

import { Store, connectTo } from "aurelia-store";
import { State } from "../../state";

import { Schedule, HolidayRule } from "../../model/schedule";
import { TranTemplate } from "../../model/tran-template";
import { TranStateActions } from "../../model/tran-actions";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('edit-schedule');


@autoinject()
@connectTo()
export class EditScheduleCustomElement {
  @bindable tran: TranTemplate = new TranTemplate();
  originalTran: TranTemplate = null;
  scheduleForm: HTMLFormElement;
  public state: State;
  private tranActions: TranStateActions;

  public constructor(private store: Store<State>, private dialogController: DialogController) {
    this.tranActions = new TranStateActions(this.store);
  }

  activate(tran: TranTemplate) {
    this.originalTran = tran;
    this.tran = Object.assign({}, tran);
    this.tran.selectedSchedule = Object.assign({}, this.tran.selectedSchedule);
  }

  cancelForm() {
    log.debug('cancel dialog');
    this.dialogController.cancel();
  }

  saveSchedule() {
    log.debug('save schedule');
    if (this.canSave) {
      this.tranActions.replaceSchedule(this.originalTran, this.tran);
      this.tran = new TranTemplate();
      this.scheduleForm.reset();
      this.dialogController.ok();
    }
  }

  scheduleMatcher(a: Schedule, b: Schedule) {
    log.debug('scheduleMatcher', a, b);
    return Schedule.equals(a, b);
  }

  get minDateTill(): string {
    return moment(this.tran.selectedSchedule.dateSince).format("YYYY-MM-DD");
  }

  @computedFrom("tran.selectedSchedule")
  get showHolidayRule(): boolean {
    return (
      this.tran &&
      Schedule.allowsHolidayRule(this.tran.selectedSchedule)
    );
  }

  @computedFrom("tran.selectedSchedule")
  get showDateRange(): boolean {
    return (
      this.tran &&
      Schedule.allowsDateRange(this.tran.selectedSchedule)
    );
  }

  @computedFrom("tran.date")
  get allOptions(): Schedule[] {
    const date = moment(this.tran.date);
    const options: Schedule[] = [];

    if (this.tran.date == null || this.tran.date == "") {
      return options;
    }

    options.push(
      new Schedule("Every " + moment(date).format("dddd"), {
        dayOfWeek: date.day()
      })
    );

    options.push(
      new Schedule("Monthly, on the " + moment(date).format("Do"), {
        day: date.date()
      })
    );

    options.push(
      new Schedule("Once a year, on " + moment(date).format("MMM Do"), {
        day: date.date(),
        month: date.month() + 1
      })
    );

    options.push(
      new Schedule("Once, on " + moment(date).format("MMM Do YYYY"), {
        day: date.date(),
        month: date.month() + 1,
        year: date.year()
      })
    );

    return options;
  }

  get canSave(): boolean {
    return (
      this.tran &&
      this.tran.selectedSchedule != null &&
      this.tran.amount !== null &&
      !isNaN(this.tran.amount) &&
      this.tran.account !== null &&
      this.tran.account.length > 0 &&
      this.tran.description !== null &&
      this.tran.description.length > 0
    );
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
