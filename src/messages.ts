import { TranSchedule } from "./tran-schedule";

export class TranAddRequest {
  constructor(public tran: TranSchedule) {}
}

export class TranEditRequested {
  constructor(public tran: TranSchedule) {}
}
