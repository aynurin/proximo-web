import { IScheduledTransaction } from "./ScheduledTransaction";

export interface ITimeTable {
  timetable: IScheduledTransaction[];
  dateLastChanged: Date;
}

export default class TimeTable {
  timetable: ITimeTable;

  constructor(timetable: ITimeTable) {
    this.timetable = timetable;
  }

  getScheduled(scheduledId: string) {
    return this.timetable.timetable.find(s => s.scheduledId == scheduledId);
  }

  static cloneState(oldState: ITimeTable): ITimeTable {
    return Object.assign({}, oldState);
  }
}
