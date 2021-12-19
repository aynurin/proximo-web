import {
  computedFrom
} from "aurelia-framework";
import { IPostingSchedule } from "lib/model/PostingSchedule";
import { ScheduleRenderer } from "./ScheduleRenderer";

// This is potentially a TranScheduleWrapper replacement

export class PostingScheduleView {
  constructor(public readonly renderer: ScheduleRenderer, public readonly postingSchedule: IPostingSchedule) {
    this 
  }
  
  @computedFrom("postingSchedule")
  get scheduleLabel(): string {
    return this.renderer.renderLabel(this.postingSchedule);
  }
}

