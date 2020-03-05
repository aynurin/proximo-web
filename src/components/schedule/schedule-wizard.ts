import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import cronstr from "../cronstr";
import * as moment from "moment";

import { connectTo } from "aurelia-store";
import { State } from "../../state";

import { Schedule, HolidayRule } from "../../model/schedule";
import { TranTemplate } from "../../model/tran-template";
import { TranStateActions } from "../../model/tran-actions";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('schedule-wizard');

@autoinject()
@connectTo()
export class ScheduleWizardCustomElement {
  @bindable tran: TranTemplate = new TranTemplate();
  scheduleWizardForm: HTMLFormElement;
  htmlModal: HTMLDivElement;
  holidayRuleNames: string[] = Object.keys(HolidayRule).filter(
    key => typeof HolidayRule[key] === "number"
  );
  public state: State;

  public flow: AddTransactionWorkflow = new AddTransactionWorkflow();

  public constructor(
    private dialogController: DialogController,
    private tranActions: TranStateActions) { }

  activate(tran: TranTemplate) {
    this.tran = tran;
    this.flow.initialStage = ScheduleStage.Date;
    this.flow.advanceIfValid(this.tran);
  }

  formChange() {
    log.debug('formChange', this.tran);
    this.flow.advanceIfValid(this.tran);
  }

  async addNewTran() {
    if (this.canSave) {
      this.tranActions.addSchedule(this.tran);
      await this.dialogController.ok();
      this.tran = new TranTemplate();
      this.flow.reset();
      this.scheduleWizardForm.reset();
    }
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
    log.debug('allOptions', moment(date).format("MMM Do YYYY"));
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
      this.tran.amount.toString() !== "" &&
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

export enum ScheduleStage {
  Initial = 0,
  Date,
  Schedule,
  HolidayRule,
  DateRange,
  Parameters
}

class AddTransactionWorkflow {
  public stage: ScheduleStage = ScheduleStage.Initial;
  public initialStage: ScheduleStage = ScheduleStage.Initial;
  public complete: () => {} = null;

  get isInitial(): boolean {
    return this.stage <= this.initialStage;
  }
  get isDate(): boolean {
    return this.stage == ScheduleStage.Date;
  }
  get isSchedule(): boolean {
    return this.stage == ScheduleStage.Schedule;
  }
  get isHolidayRule(): boolean {
    return this.stage == ScheduleStage.HolidayRule;
  }
  get isDateRange(): boolean {
    return this.stage == ScheduleStage.DateRange;
  }
  get isParameters(): boolean {
    return this.stage == ScheduleStage.Parameters;
  }

  advance(tran: TranTemplate) {
    if (this.stage != ScheduleStage.Parameters) {
      this.stage += 1;
      if (
        this.stage == ScheduleStage.HolidayRule &&
        tran &&
        tran.selectedSchedule &&
        !Schedule.allowsHolidayRule(tran.selectedSchedule)
      ) {
        this.advance(tran);
      }
      if (
        this.stage == ScheduleStage.DateRange &&
        tran &&
        tran.selectedSchedule &&
        !Schedule.allowsDateRange(tran.selectedSchedule)
      ) {
        this.advance(tran);
      }
    } else {
      if (this.complete != null) {
        this.complete();
        this.reset();
      }
    }
  }

  advanceIfValid(tran: TranTemplate) {
    log.debug(
      `Request to advance from ${ScheduleStage[this.stage]} to ${
      ScheduleStage[this.stage + 1]
      }`, tran
    );
    if (this.stage == ScheduleStage.Initial) {
      tran.date = "";
      this.advance(tran);
    } else if (this.stage == ScheduleStage.Date) {
      if (
        tran.date != null &&
        tran.date.trim() != "" &&
        moment(tran.date).isValid
      ) {
        this.advance(tran);
      } else {
        log.debug(
          "Cannot advance from " + this.stage + " stage with tran.date =",
          tran.date
        );
      }
    } else if (this.stage == ScheduleStage.Schedule) {
      if (
        tran.selectedSchedule != null &&
        tran.selectedSchedule.cron != null &&
        tran.selectedSchedule.cron.length == 4
      ) {
        this.advance(tran);
      } else {
        log.debug(
          "Cannot advance from " +
          this.stage +
          " stage with tran.selectedSchedule =",
          tran.selectedSchedule
        );
      }
    } else if (this.stage == ScheduleStage.HolidayRule) {
      if (
        tran.selectedSchedule != null &&
        tran.selectedSchedule.holidayRule != null &&
        tran.selectedSchedule.holidayRule >= 0 &&
        tran.selectedSchedule.holidayRule <= 2
      ) {
        this.advance(tran);
      } else {
        log.debug(
          "Cannot advance from " +
          this.stage +
          " stage with tran.selectedSchedule =",
          tran.selectedSchedule
        );
      }
    } else if (this.stage == ScheduleStage.DateRange) {
      if (tran.selectedSchedule != null) {
        if (
          (tran.selectedSchedule.dateSince == null ||
            tran.selectedSchedule.dateSince.trim() == "") &&
          (tran.selectedSchedule.dateTill == null ||
            tran.selectedSchedule.dateTill.trim() == "")
        ) {
          this.advance(tran);
        } else {
          let since =
            tran.selectedSchedule.dateSince != null &&
              tran.selectedSchedule.dateSince.trim() != "" &&
              moment(tran.selectedSchedule.dateSince).isValid
              ? moment(tran.selectedSchedule.dateSince)
              : null;
          let till =
            tran.selectedSchedule.dateTill != null &&
              tran.selectedSchedule.dateTill.trim() != "" &&
              moment(tran.selectedSchedule.dateTill).isValid
              ? moment(tran.selectedSchedule.dateTill)
              : null;
          if (since == null || till == null || since < till) {
            this.advance(tran);
          } else {
            log.debug(
              "Cannot advance from " +
              this.stage +
              " stage with tran.selectedSchedule =",
              tran.selectedSchedule
            );
          }
        }
      } else {
        log.debug(
          "Cannot advance from " +
          this.stage +
          " stage with tran.selectedSchedule =",
          tran.selectedSchedule
        );
      }
    } else if (this.stage == ScheduleStage.Parameters) {
      if (
        tran.account != null &&
        tran.account.trim() != "" &&
        tran.description != null &&
        tran.description.trim() != "" &&
        tran.amount != null &&
        !isNaN(tran.amount)
      ) {
        this.advance(tran);
      } else {
        log.debug(
          "Cannot advance from " + this.stage + " stage with tran =",
          tran
        );
      }
    }
  }

  back() {
    if (this.stage > this.initialStage) {
      this.stage -= 1;
    }
  }

  reset() {
    this.stage = this.initialStage;
  }
}
