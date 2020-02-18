import { autoinject, computedFrom, inject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

import { Store, connectTo } from "aurelia-store";
import { State } from "./state";

import { TranGenerated } from "./model/tran-generated";
import { Schedule } from "./model/schedule";

import * as CronParser from "cron-parser";
import * as moment from "moment";

@autoinject()
@connectTo()
export class TranGeneratorCustomElement {
  public state: State;

  public constructor(
    private store: Store<State>,
    private ea: EventAggregator
  ) {}

  publish() {
    return this.generatedLedger;
  }

  @computedFrom("state.schedule")
  get generatedLedger(): TranGenerated[] {
    let start = new Date();
    let end = new Date();
    end.setFullYear(end.getFullYear() + 1);

    var options = {
      currentDate: start,
      endDate: end
    };

    let ledger: TranGenerated[] = [];
    for (const tran of this.state.schedule) {
      const thisOptions = Object.assign({}, options);
      const since = getBestDate(start, tran.selectedSchedule.dateSince);
      const till = getBestDate(end, tran.selectedSchedule.dateTill);
      if (
        since > moment(thisOptions.currentDate)
      ) {
        thisOptions.currentDate = since.toDate();
      }
      if (
        till < moment(thisOptions.endDate)
      ) {
        thisOptions.endDate = till.toDate();
      }
      console.log(tran.description, thisOptions);
      const interval = CronParser.parseExpression(
        cronexpr(tran.selectedSchedule),
        thisOptions
      );
      while (true) {
        try {
          let tr = {
            date: interval.next().toDate(),
            account: tran.account,
            amount: tran.amount,
            balance: 0,
            description: tran.description
          };
          ledger.push(tr);
        } catch (e) {
          break;
        }
      }

      ledger.sort((a, b) => {
        let diff = +a.date - +b.date;
        if (diff == 0) {
          diff = b.amount - a.amount;
        }
        return diff;
      });

      let balances = {};
      for (let acc of this.state.accounts2) {
        balances[acc.account] = acc.balance;
      }

      for (let tran of ledger) {
        let acc = tran.account;
        let accBalance = 0;
        if (acc in balances) {
          accBalance = +balances[acc];
        }
        accBalance += +tran.amount;
        tran.balance = +accBalance;
        balances[acc] = +accBalance;
      }
    }
    this.ea.publish("ledgerGenerated", ledger);
    console.log("published ledger", ledger.length);
    return ledger;
  }
}

function cronexpr(sched: Schedule): string {
  return ["0", "0", ...sched.cron.slice(0, 3)].join(" ");
}

function getBestDate(one: Date, another: Date | string) {
  if (another == null || another.toString().trim() == '') {
    return moment(one);
  } else {
    return moment(another);
  }
}