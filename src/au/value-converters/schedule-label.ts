import { autoinject } from 'aurelia-framework';
import { IPostingSchedule } from 'lib/model/PostingSchedule';
import { ScheduleRenderer } from 'lib/view/ScheduleRenderer';

@autoinject
export class ScheduleLabelValueConverter {
  constructor(private scheduleRenderer: ScheduleRenderer) {}
  /*
    format can be:
      alone: 1st of the month
      when: The following transaction will run ...:
  */
  toView(sched: IPostingSchedule, format?: string) {
    if (!sched) return null;
    return this.scheduleRenderer.renderLabel(sched);
  }
}
