import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import cronstr from "../cronstr";
import * as moment from "moment";

import { connectTo } from "aurelia-store";

import { Schedule, HolidayRule } from "../../model/schedule";
import { TranTemplate, TranScheduleWrapper } from "../../model/tran-template";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';
import { IntroContainer, IntroBuildingContext, IIntroPage } from "components/intro-building-context";
import { waitForHtmlElement, waitFor } from "components/utils";

const COMPONENT_NAME = "schedule-wizard";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class ScheduleWizardCustomElement {
  @bindable tranwr: TranScheduleWrapper<TranTemplate> = new TranScheduleWrapper(new TranTemplate());
  private intro: IntroContainer;
  private introPages: IIntroPage[];
  private flow: AddTransactionWorkflow = new AddTransactionWorkflow();

  public constructor(
    private dialogController: DialogController,
    private introContext: IntroBuildingContext) { }

  activate(tran: TranTemplate) {
    log.debug('activate');
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
    this.flow.onStageChangedCallback = this.showIntroPage;
    waitForHtmlElement("scheduleWizardForm", element => this.readyForIntro(element));
    this.tranwr = new TranScheduleWrapper(tran);
    this.flow.initialStage = ScheduleStage.Date;
    this.flow.advanceIfValid(this.tranwr.value);
  }

  readyForIntro = (element: HTMLElement) => {
    element = element.parentElement;
    log.debug("readyForIntro", element);
    this.introPages = this.introContext.getPagesToShow(this.intro, [
      { element, version: 1, id: 'date.default' },
      { element, version: 1, id: 'schedule.default' },
      { element, version: 1, id: 'holidayrule.default' },
      { element, version: 1, id: 'daterange.default' },
      { element, version: 1, id: 'parameters.default' }
    ]);
    this.introContext.startHints(this.introPages);
  }

  showIntroPage = (oldStage: ScheduleStage, newStage: ScheduleStage) => {
    // we are in race condition with readyForIntro here.
    waitFor(() => this.introPages != null, () => {
      log.debug(`Moving from stage ${oldStage} to stage ${newStage}`);
      let introPageId = ScheduleStage[newStage].toLowerCase() + ".default";
      let pageIndex = this.introPages.findIndex(page => page.id == introPageId);
      let page = this.introPages[pageIndex];
      if (page) {
        this.introContext.showOnePage(pageIndex, page);
      }
    });
  }

  formChange() {
    log.debug('formChange', this.tranwr);
    this.flow.advanceIfValid(this.tranwr.value);
  }

  startOver() {
    this.tranwr.value.date = "";
    this.flow.reset();
  }

  async addNewTran() {
    if (this.canSave) {
      this.introContext.completeIntro();
      this.introContext.clear();
      this.flow.onStageChangedCallback = null;
      await this.dialogController.ok(this.tranwr.value);
      this.tranwr = new TranScheduleWrapper(new TranTemplate());
      this.flow.reset();
    }
  }

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
    log.debug('allOptions for', moment(date).format("MMM Do YYYY"));
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
      new Schedule(date, "Every other " + moment(date).format("dddd"), {
        dayOfWeek: date.day(),
        nthDayOfWeek: 2
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
    if (!this.tranwr || !this.tranwr.value) {
      return false;
    }
    return this.tranwr.isValid;
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

export enum ScheduleStage {
  Initial = 0,
  Date,
  Schedule,
  HolidayRule,
  DateRange,
  Parameters
}

class AddTransactionWorkflow {
  public __stage: ScheduleStage = ScheduleStage.Initial;
  public initialStage: ScheduleStage = ScheduleStage.Initial;
  public complete: () => {} = null;
  public onStageChangedCallback: (oldStage: ScheduleStage, newStage: ScheduleStage) => any;

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

  set stage(newStage: ScheduleStage) {
    let previousStage = this.__stage;
    this.__stage = newStage;
    if (typeof this.onStageChangedCallback === "function") {
      this.onStageChangedCallback(previousStage, newStage);
    }
  }

  get stage(): ScheduleStage {
    return this.__stage;
  }

  advance(tran: TranTemplate, step: number = 1) {
    let newStage = this.stage + step;
    if (newStage < this.initialStage) {
      // won't move
    } else if (newStage > ScheduleStage.Parameters) {
      // we're done
      if (this.complete != null) {
        this.complete();
        this.reset();
      }
    } else {
      // check if the new step is not skipped
      if ((tran != null && tran.selectedSchedule != null) &&
         ((newStage == ScheduleStage.HolidayRule && !Schedule.allowsHolidayRule(tran.selectedSchedule))
        ||(newStage == ScheduleStage.DateRange && !Schedule.allowsDateRange(tran.selectedSchedule)))
      ) {
        if (step > 0) step++;
        else step--;
        this.advance(tran, step);
      } else {
        // move
        this.stage = newStage;
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
          (tran.selectedSchedule.dateSince == null) &&
          (tran.selectedSchedule.dateTill == null)
        ) {
          this.advance(tran);
        } else {
          let since =
            tran.selectedSchedule.dateSince != null &&
              moment(tran.selectedSchedule.dateSince).isValid
              ? moment(tran.selectedSchedule.dateSince)
              : null;
          let till =
            tran.selectedSchedule.dateTill != null &&
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

  back(tran: TranTemplate) {
    this.advance(tran, -1);
  }

  reset() {
    this.stage = this.initialStage;
  }
}
