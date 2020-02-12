import {
  inject
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { TranSchedule } from "./tran-schedule";
import { TranAddRequest, TranEditRequested } from "./messages";

@inject(EventAggregator)
export class App {
  message = "FinForecast";
  schedule: TranSchedule[] = [];
  accounts: string[] = [];
  newTran: TranSchedule = new TranSchedule();

  public constructor(public ea: EventAggregator) {
    ea.subscribe(TranAddRequest, (r: TranAddRequest) => this.addTran(r.tran));
  }

  addTran(tran: TranSchedule) {
    console.log("addTran", tran);
    // const newTran = TranSchedule.isEmpty(tran) ? this.newTran : tran;
    // if (!TranSchedule.isEmpty(newTran)) {
    //   this.schedule.push(newTran);
    //   if (this.accounts.find(acc => acc == newTran.account) == null) {
    //     this.accounts.push(newTran.account)
    //   }
    //   this.newTran = new TranSchedule();
    //   this.accounts.sort((a, b) => a.localeCompare(b));
    // }
  }

  removeTran(tran: TranSchedule) {
    let index = this.schedule.indexOf(tran);
    if (index !== -1) {
      this.schedule.splice(index, 1);
    }
  }
}
