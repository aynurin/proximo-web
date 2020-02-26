import { autoinject, computedFrom, inject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

import { Store, connectTo } from "aurelia-store";
import { State } from "./state";

import { TranGenerated } from "./model/tran-generated";
import { Schedule } from "./model/schedule";

import * as CronParser from "cron-parser";
import * as moment from "moment";

import { TranStateActions } from "./model/tran-actions";
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('ledger');

const __cacheSec: number = 10;
@autoinject()
@connectTo()
export class LedgerCustomElement {
  public state: State;
  private ledger: TranGenerated[] = null;
  private lastGenerated: number = null;
  private cachedCount: number = 0.0;
  private calculatedCount: number = 0.0;
  private tranActions: TranStateActions;

  public constructor(private store: Store<State>, private ea: EventAggregator) {
    this.tranActions = new TranStateActions(this.store);
  }

  publish() {
    return this.generatedLedger;
  }

  getRowStyleForTran(tran: TranGenerated) {
    if (tran.balances[tran.account] < 0) {
      return 'table-danger';
    } else if (tran.balances[tran.account] < 50) {
      return 'table-warning';
    }
  }

  @computedFrom("state.schedule")
  get generatedLedger(): TranGenerated[] {
    const generatingTime = Math.floor(+new Date() / 1000);
    const returnCached = generatingTime - this.lastGenerated <= __cacheSec;
    if (returnCached) {
      this.cachedCount++;
      log.debug(
        "Returning cached ledger.",
        "Cache-hit ratio:",
        this.cachedCount / this.calculatedCount
      );
    } else {
      this.calculatedCount++;
      log.debug(
        "Recalculating ledger. Last calculated:",
        generatingTime - this.lastGenerated,
        "Cache-hit ratio:",
        this.cachedCount / this.calculatedCount
      );
    }

    if (returnCached) {
      return this.ledger;
    }

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
      if (since > moment(thisOptions.currentDate)) {
        thisOptions.currentDate = since.toDate();
      }
      if (till < moment(thisOptions.endDate)) {
        thisOptions.endDate = till.toDate();
      }
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
            balances: {},
            description: tran.description,
            schedule: tran.selectedSchedule.label
          };
          ledger.push(tr);
        } catch (e) {
          break;
        }
      }
    }

    let balances = {};
    for (let acc of this.state.accounts2) {
      balances[acc.account] = +acc.balance;
    }

    ledger.sort((a, b) => {
      let diff = +a.date - +b.date;
      if (diff == 0) {
        diff = b.amount - a.amount;
      }
      return diff;
    });

    for (let gtran of ledger) {
      let acc = gtran.account;
      // if there is an inconsistency where the state does not have this transaction's account,
      // this code will break. May it break, so we can find a root cause.
      let accBalance = balances[acc];
      accBalance += +gtran.amount;
      balances[acc] = accBalance;
      gtran.balances = Object.assign({}, balances);
    }

    this.ea.publish("ledgerGenerated", ledger);
    log.debug("published ledger", ledger.length);
    this.ledger = ledger;
    this.lastGenerated = generatingTime;
    return this.ledger;
  }

  objectValues(o: any): any[] {
    return Object.values(o);
  }
}

function cronexpr(sched: Schedule): string {
  return ["0", "0", ...sched.cron.slice(0, 3)].join(" ");
}

function getBestDate(one: Date, another: Date | string) {
  if (another == null || another.toString().trim() == "") {
    return moment(one);
  } else {
    return moment(another);
  }
}
