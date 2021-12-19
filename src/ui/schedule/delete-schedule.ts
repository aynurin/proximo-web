import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

import { connectTo } from "aurelia-store";
import { IPerson } from "lib/model/Person";

import { IScheduledTransaction } from 'lib/model/ScheduledTransaction';
import StateMutationFactory from "lib/state/StateMutationFactory"
import { DialogController } from 'aurelia-dialog';
import { ScheduleRenderer } from "lib/view/ScheduleRenderer";

@autoinject()
@connectTo()
export class DeleteScheduleCustomElement {
  @bindable tran: IScheduledTransaction;
  scheduleForm: HTMLFormElement;
  public state: IPerson;

  public constructor(
    private dialogController: DialogController,
    private tranActions: StateMutationFactory, 
    private ea: EventAggregator,
    private scheduleLabelRenderer: ScheduleRenderer) {
  }

  activate(tran: IScheduledTransaction) {
    this.tran = tran;
  }

  async cancelForm() {
    await this.dialogController.cancel();
  }

  async deleteSchedule() {
    await this.tranActions.timeTableActions.removeScheduled(this.tran);
    this.ea.publish('schedule-changed');
    await this.dialogController.ok();
  }

  @computedFrom("cron")
  get scheduleLabel(): string {
    return this.scheduleLabelRenderer.renderLabel(this.tran.schedule);
  }
}
