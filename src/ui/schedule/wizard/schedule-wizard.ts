import {
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

import { connectTo } from "aurelia-store";

import PostingSchedule, { HolidayRule } from "lib/model/PostingSchedule";
import { IScheduledTransaction } from "lib/model/ScheduledTransaction";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';
import { IntroContainer, IntroBuildingContext, IIntroItem } from "lib/intro-building-context";
import { waitForHtmlElement, waitFor, isNonEmptyString, isValidNumber } from "lib/utils";
import { ScheduleRenderer } from "lib/view/ScheduleRenderer";
import TransactionBuilder from "lib/model/TransactionBuilder";
import { EditScheduleCustomElement } from "../edit-schedule";
import StateMutationFactory from "lib/state/StateMutationFactory";

const COMPONENT_NAME = "schedule-wizard";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class ScheduleWizardCustomElement extends EditScheduleCustomElement {
  private intro: IntroContainer;
  private introPages: IIntroItem[];
  private flow: AddTransactionWorkflow;

  public constructor(
    private introContext: IntroBuildingContext,
    dialogController: DialogController,
    tranActions: StateMutationFactory, 
    ea: EventAggregator,
    scheduleRenderer: ScheduleRenderer) { 
      super(dialogController, tranActions, ea, scheduleRenderer);
    }

  activate(tran: IScheduledTransaction) {
    super.activate(tran);
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
    this.startFlow(this.originalTransaction);
  }

  readyForIntro = (element: HTMLElement) => {
    element = element.parentElement;
    log.debug("readyForIntro", element);
    this.introPages = this.introContext.getPagesToShow(this.intro, [
      { element, version: 1, intro: null, hint: null, id: 'date' },
      { element, version: 1, intro: null, hint: null, id: 'schedule' },
      { element, version: 1, intro: null, hint: null, id: 'holidayrule' },
      { element, version: 1, intro: null, hint: null, id: 'daterange' },
      { element, version: 1, intro: null, hint: null, id: 'parameters' }
    ]);
    this.introContext.startHints(this.introPages);
  }

  showIntroPage = (oldStage: ScheduleStage, newStage: ScheduleStage) => {
    // we are in race condition with readyForIntro here.
    waitFor(() => this.introPages != null, () => {
      log.debug(`Moving from stage ${oldStage} to stage ${newStage}`);
      const introPageId = ScheduleStage[newStage].toLowerCase() + ".default";
      const pageIndex = this.introPages.findIndex(page => page.id == introPageId);
      const page = this.introPages[pageIndex];
      if (page) {
        this.introContext.showOnePage(pageIndex, page);
      }
    });
  }

  startFlow(tran: IScheduledTransaction = null) {
    this.builder = new TransactionBuilder(tran);
    this.flow = new AddTransactionWorkflow(this.builder);
    this.flow.initialStage = ScheduleStage.Date;
    this.flow.onStageChangedCallback = this.showIntroPage;
    waitForHtmlElement("scheduleWizardForm", element => this.readyForIntro(element));
    this.flow.advanceIfValid();
  }

  formChange() {
    log.debug('formChange', this.builder.buffer);
    this.flow.advanceIfValid();
  }

  startOver() {
    this.startFlow(this.originalTransaction);
  }

  async addNewTran() {
    if (this.canSave) {
      this.introContext.completeIntro();
      this.introContext.clear();
      this.flow.onStageChangedCallback = null;
      await this.dialogController.ok(this.builder.build());
      this.startFlow();
    }
  }

  @computedFrom("builder.buffer")
  get canSave(): boolean {
    return this.flow.isComplete;
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
  public complete: () => void = null;
  public onStageChangedCallback: (oldStage: ScheduleStage, newStage: ScheduleStage) => void;

  constructor(public builder: TransactionBuilder) {
  }

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
    const previousStage = this.__stage;
    this.__stage = newStage;
    if (typeof this.onStageChangedCallback === "function") {
      this.onStageChangedCallback(previousStage, newStage);
    }
  }

  get stage(): ScheduleStage {
    return this.__stage;
  }

  advanceIfValid() {
    log.debug(`Request to advance from ${ScheduleStage[this.stage]} to ${ScheduleStage[this.stage + 1]}`);
    if (this.isStageComplete()) {
      this.advance();
    }
  }

  advance(step = 1) {
    const newStage = this.stage + step;
    if (newStage < this.initialStage) {
      // won't move
    } else if (newStage > ScheduleStage.Parameters) {
      // we're done
      if (this.complete != null) {
        this.complete();
      }
    } else {
      // check if the new step is not skipped
      if ((newStage == ScheduleStage.HolidayRule && !PostingSchedule.allowsHolidayRule(this.builder.buffer.scheduleLabel))
          || (newStage == ScheduleStage.DateRange && !PostingSchedule.allowsDateRange(this.builder.buffer.scheduleLabel))) {
        if (step > 0) step++;
        else step--;
        this.advance(step);
      } else {
        // move
        this.stage = newStage;
      }
    }
  }

  get isComplete(): boolean {
    return this.isStageComplete(ScheduleStage.Date)
        && this.isStageComplete(ScheduleStage.Schedule)
        && this.isStageComplete(ScheduleStage.HolidayRule)
        && this.isStageComplete(ScheduleStage.DateRange)
        && this.isStageComplete(ScheduleStage.Parameters);
  }

  isStageComplete(stage: ScheduleStage = null): boolean {
    let isStageComplete = false;
    stage = stage ?? this.stage;
    switch (stage) {
      case ScheduleStage.Initial:
        isStageComplete = true;
        break;

      case ScheduleStage.Date:
        isStageComplete = this.builder.buffer.refDate != null;
        break;

      case ScheduleStage.Schedule:
        isStageComplete = this.builder.buffer.scheduleLabel != null;
        break;

      case ScheduleStage.HolidayRule:
        // return this.transaction.schedule.holidayRule != null && Object.values(HolidayRule).includes(this.transaction.schedule.holidayRule);
        isStageComplete = this.builder.buffer.holidayRule == null || this.builder.buffer.holidayRule in HolidayRule;
        break;

      case ScheduleStage.DateRange:
        isStageComplete = (this.builder.buffer.dateSinceIncl == null && this.builder.buffer.dateTillIncl == null)
             || this.builder.buffer.dateSinceIncl < this.builder.buffer.dateTillIncl;
        break;

      case ScheduleStage.Parameters:
        isStageComplete = (this.builder.buffer.accountId != null 
                  || (this.builder.buffer.accountIsNew === true && isNonEmptyString(this.builder.buffer.accountFriendlyName)))
            && (isNonEmptyString(this.builder.buffer.description))
            && (isValidNumber(this.builder.buffer.amount));
        break;
    }
    if (isStageComplete === false) {
      log.debug(`Stage ${stage} is not complete`, this.builder.buffer);
    }
    return isStageComplete;
  }

  back() {
    this.advance(-1);
  }
}
