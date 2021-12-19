import {
  autoinject,
} from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { connectTo } from "aurelia-store";

import { IScheduledTransaction } from "lib/model/ScheduledTransaction";
import StateMutationFactory from 'lib/state/StateMutationFactory';

import { IPerson } from "lib/model/Person";
import { IntroContainer, IntroBuildingContext } from "lib/intro-building-context";

import environment from '../../../config/environment.json';
import { waitFor } from "lib/utils";
import { ScheduleRenderer } from "lib/view/ScheduleRenderer"
import { AccountRenderer } from "lib/view/AccountRenderer";

const COMPONENT_NAME = "schedule-grid";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class ScheduleGridCustomElement {
  public state: IPerson;
  private htmlElement: HTMLTableElement;
  private intro: IntroContainer;

  public constructor(
    private tranActions: StateMutationFactory,
    private ea: EventAggregator,
    private introContext: IntroBuildingContext,
    private scheduleRenderer: ScheduleRenderer,
    private accountRenderer: AccountRenderer) { }

  created() {
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  attached() {
    waitFor(() => this.htmlElement && this.htmlElement.rows.length > 0, this.readyForIntro);
  }

  readyForIntro = () => {
    log.debug("readyForIntro");
    this.intro.ready([{
      element: this.htmlElement,
      intro: `schedule:${COMPONENT_NAME}.intro.default`,
      hint: null,
      version: 1,
      priority: 0
    }]);
  }

  async removeSchedule(tran: IScheduledTransaction) {
    await this.tranActions.timeTableActions.removeScheduled(tran);
    this.ea.publish('schedule-changed');
  }

  // TODO: Move to somewhere global
  get isProduction(): boolean { return environment.debug === false; }

  scheduleLabel(tran: IScheduledTransaction): string {
    return this.scheduleRenderer.renderLabel(tran.schedule);
  }

  accountLabel(tran: IScheduledTransaction): string {
    return this.accountRenderer.renderScheduledAccountLabel(tran);
  }
}
