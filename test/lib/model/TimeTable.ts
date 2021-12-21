import { IScheduledTransaction } from "lib/model/ScheduledTransaction";

export interface ITimeTable {
  timetableId: string;
  timetable: IScheduledTransaction[];
  dateLastChanged: Date;
}

export default class TimeTable {
  timetable: ITimeTable;

  constructor(timetable: ITimeTable) {
    this.timetable = timetable;
  }

  getSchedule(scheduledId: string) {
    return this.timetable.timetable.find(s => s.scheduledId == scheduledId);
  }

  static cloneState(oldState: ITimeTable): ITimeTable {
    return Object.assign({}, oldState);
  }
}
