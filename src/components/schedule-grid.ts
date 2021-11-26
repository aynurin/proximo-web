import {
  autoinject,
} from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { connectTo } from "aurelia-store";

import { DateFormat } from "./date-format";

import { HolidayRule, Schedule } from "../model/schedule";
import { TranTemplate, TranScheduleWrapper } from "../model/tran-template";
import { TranStateActions } from "../model/tran-actions";

import { State } from "../state";
import { IntroContainer, IntroBuildingContext } from "./intro-building-context";
import cronstr from "../components/cronstr";

import environment from '../../config/environment.json';
import { waitFor } from "./utils";

const COMPONENT_NAME = "schedule-grid";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class ScheduleGridCustomElement {
  public state: State;
  private htmlElement: HTMLTableElement;
  private intro: IntroContainer;
  private dateFormatter = new DateFormat();

  public constructor(
    private tranActions: TranStateActions,
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  attached() {
    log.debug('attached');
    waitFor(() => this.htmlElement && this.htmlElement.rows.length > 0, this.readyForIntro);
  }

  readyForIntro = () => {
    log.debug("readyForIntro");
    this.intro.ready([{
      element: this.htmlElement,
      intro: `schedule:${COMPONENT_NAME}.intro.default`,
      version: 1,
      priority: 0
    }]);
  }

  async removeSchedule(tran: TranTemplate) {
    await this.tranActions.removeSchedule(tran);
    this.ea.publish('schedule-changed');
  }

  get isProduction(): boolean { return environment.debug === false; };

  scheduleLabel(tran: TranTemplate): string {
    const sched = tran.selectedSchedule;
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

  accountLabel(tran: TranTemplate): string {
    return (new TranScheduleWrapper(tran).accountLabel);
  }
}
