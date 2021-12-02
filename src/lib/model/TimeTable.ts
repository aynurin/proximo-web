import CustomError from "./CustomError";
import { IScheduledTransaction } from "./ScheduledTransaction";

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

  static cloneState(oldState: ITimeTable): ITimeTable {
    return Object.assign({}, oldState);
  }
}
