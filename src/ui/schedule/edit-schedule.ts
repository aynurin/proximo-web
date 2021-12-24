import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { DateFormat } from "lib/DateFormat";

import { IPerson } from "lib/model/Person";

import PostingSchedule, { IPostingSchedule } from "lib/model/PostingSchedule";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';
import StateMutationFactory from 'lib/state/StateMutationFactory';
import { IScheduledTransaction } from "lib/model/ScheduledTransaction";
import TransactionBuilder, { TransactionType } from "lib/model/TransactionBuilder";
import { connectTo } from "aurelia-store";
import { ScheduleRenderer } from "lib/view/ScheduleRenderer";

const log = LogManager.getLogger('edit-schedule');


@connectTo()
@autoinject()
export class EditScheduleCustomElement {
  @bindable originalTransaction: IScheduledTransaction;
  public builder: TransactionBuilder;
  scheduleForm: HTMLFormElement;
  public state: IPerson;
  protected dateFormatter = new DateFormat();

  refDate: Date;

  public constructor(
    protected dialogController: DialogController,
    protected tranActions: StateMutationFactory, 
    protected ea: EventAggregator,
    protected scheduleRenderer: ScheduleRenderer) { }

  activate(tran: IScheduledTransaction) {
    log.debug('activate', tran);
    this.originalTransaction = tran;
    this.builder = new TransactionBuilder(tran);
  }

  async cancelForm() {
    log.debug('cancelForm');
    await this.dialogController.cancel();
  }

  async saveSchedule() {
    log.debug('saveSchedule');
    if (this.canSave) {
      const changeSet = this.builder.build();
      await this.tranActions.save(changeSet);
      this.ea.publish('schedule-changed');
      await this.dialogController.ok(changeSet);
    }
  }

  scheduleMatcher(a: IPostingSchedule, b: IPostingSchedule) {
    return a.label == b.label;
  }

  get dateTillMinBoundary(): string {
    return this.dateFormatter.toISODate(this.builder.buffer.dateSinceIncl);
  }

  @computedFrom("builder.buffer.amount", "builder.buffer.transferToAccountId", "builder.buffer.transferToAccountRequired")
  get transactionType(): TransactionType {
    return this.builder.transactionType;
  }

  set transactionType(type: TransactionType) {
    this.builder.transactionType = type;
  }

  @computedFrom("builder.buffer.amount", "builder.buffer.transferToAccountId", "builder.buffer.transferToAccountRequired")
  get isTransfer(): boolean {
    return this.builder.transactionType === TransactionType.Transfer;
  }

  @computedFrom("builder.buffer")
  get showHolidayRule(): boolean {
    return PostingSchedule.allowsHolidayRule(this.builder.buffer.scheduleLabel);
  }

  @computedFrom("builder.buffer")
  get showDateRange(): boolean {
    return PostingSchedule.allowsDateRange(this.builder.buffer.scheduleLabel);
  }

  @computedFrom("builder.buffer")
  get allOptions(): IPostingSchedule[] {
    log.debug('allOptions for', this.dateFormatter.toHumanReadableShort(this.builder.buffer.refDate));

    const refDate = this.builder.buffer.refDate;
    const options: IPostingSchedule[] = [];

    options.push(PostingSchedule.createNew().weekly(refDate.getDay()));
    options.push(PostingSchedule.createNew().secondWeek(refDate.getDay(), refDate));
    options.push(PostingSchedule.createNew().monthly(refDate.getDate()));
    options.push(PostingSchedule.createNew().annually(refDate.getMonth() + 1, refDate.getDate()));
    options.push(PostingSchedule.createNew().once(refDate.getFullYear(), refDate.getMonth() + 1, refDate.getDate()));

    return options;
  }

  @computedFrom("builder.buffer")
  get canSave(): boolean {
    return this.builder.canBuild;
  }

  @computedFrom("builder.buffer")
  get scheduleLabel(): string {
    return this.scheduleRenderer.renderLabel(this.builder.createPostingSchedule());
  }
}
