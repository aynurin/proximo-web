import {
  inject
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { TranBuilder } from "./tran-builder";
import { TranAddRequest, TranEditRequested } from "./messages";

@inject(EventAggregator)
export class App {
  message = "FinForecast";
  schedule: TranBuilder[] = [];
  accounts: string[] = [];

  public constructor(public ea: EventAggregator) {
    ea.subscribe(TranAddRequest, (r: TranAddRequest) => this.addTran(r.tran));
  }

  addTran(tran: TranBuilder) {
    this.schedule.push(tran);
    
    if (this.accounts.find(acc => acc == tran.account) == null) {
      this.accounts.push(tran.account)
    }
    this.accounts.sort((a, b) => a.localeCompare(b));
  }

  removeTran(tran: TranBuilder) {
    let index = this.schedule.indexOf(tran);
    if (index !== -1) {
      this.schedule.splice(index, 1);
    }
  }
}
