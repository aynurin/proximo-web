import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import cronstr from "lib/cronstr";
import { DateFormat } from "lib/date-format";

import { connectTo } from "aurelia-store";

import { Schedule, HolidayRule } from "lib/model/schedule";
import { TranTemplate, TranScheduleWrapper } from "lib/model/tran-template";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';
import { IntroContainer, IntroBuildingContext, IIntroPage } from "lib/intro-building-context";
import { waitForHtmlElement, waitFor } from "lib/utils";

const COMPONENT_NAME = "schedule-wizard";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class ScheduleWizardCustomElement {
  @bindable tranwr: TranScheduleWrapper<TranTemplate> = new TranScheduleWrapper(new TranTemplate());
  private intro: IntroContainer;
  private introPages: IIntroPage[];
  private flow: AddTransactionWorkflow = new AddTransactionWorkflow();
  private dateFormatter = new DateFormat();

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
      { element, version: 1, id: 'date' },
      { element, version: 1, id: 'schedule' },
      { element, version: 1, id: 'holidayrule' },
      { element, version: 1, id: 'daterange' },
      { element, version: 1, id: 'parameters' }
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
    const date = this.dateFormatter.parse(this.tranwr.value.date);
    log.debug('allOptions for', this.dateFormatter.toHumanReadableShort(date));
    const options: Schedule[] = [];

    if (this.tranwr.value.date == null || this.tranwr.value.date == "") {
      return options;
    }

    options.push(
      new Schedule(date, "Every " + this.dateFormatter.toDayOfWeek(date), {
        dayOfWeek: date.getDay()
      })
    );

    options.push(
      new Schedule(date, "Every other " + this.dateFormatter.toDayOfWeek(date), {
        dayOfWeek: date.getDay(),
        nthDayOfWeek: 2
      })
    );

    options.push(
      new Schedule(date, "Monthly, on the " + this.dateFormatter.toDate(date), {
        day: date.getDate()
      })
    );

    options.push(
      new Schedule(date, "Once a year, on " + this.dateFormatter.toMonthDate(date), {
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
  private dateFormatter = new DateFormat();

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
        this.dateFormatter.isValidDate(tran.date)
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
          if (tran.selectedSchedule.dateSince == null || tran.selectedSchedule.dateTill == null || tran.selectedSchedule.dateSince < tran.selectedSchedule.dateTill) {
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
