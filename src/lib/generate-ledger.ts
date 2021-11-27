import { autoinject, noView, observable } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { Store } from "aurelia-store";

import * as CronParser from "cron-parser";
import { DateFormat } from "lib/date-format";
import { Subscription } from "rxjs";

import { State } from "lib/state";

import { Schedule } from "lib/model/schedule";
import { TranStateActions } from "lib/model/tran-actions";
import { TranGenerated, TranState } from "lib/model/tran-template";
import { subarray } from "lib/subarray";

const log = LogManager.getLogger('generate-ledger');

@noView()
@autoinject()
export class GenerateLedger {
  @observable public state: State;
  private subscription: Subscription;
  private dateFormatter = new DateFormat();
  private ledger: TranGenerated[] = null;

  public constructor(
    public store: Store<State>,
    private ea: EventAggregator,
    private tranActions: TranStateActions) {
    ea.subscribe('schedule-changed', this.scheduleChanged);
    ea.subscribe('accounts-changed', this.accountsChanged);
    ea.subscribe('state-hydrated', this.stateHydrated);
  }

  public bind() {
    this.subscription = this.store.state.subscribe(
      (state) => this.state = state
    );
  }

  public unbind() {
    this.subscription.unsubscribe();
  }

  private stateHydrated = async () => {
    log.debug('stateRehydrated');
    await this.generateLedger(this.state);
  }

  private scheduleChanged = async () => {
    log.debug('scheduleChanged');
    await this.generateLedger(this.state);
  }

  private accountsChanged = async () => {
    log.debug('accountsChanged');
    await this.generateLedger(this.state);
  }

  getPastLedger(ledger: TranGenerated[], date: Date): TranGenerated[] {
    if (ledger == null) {
      return [];
    }
    return subarray(ledger,
      tran => tran.date >= addDays(date, -7),
      tran => tran.date <= date);
  }

  public generateLedger = async (state: State): Promise<TranGenerated[]> => {
    log.debug('generateLedger', state ? state.scheduleVersion : 'none');
    let accounts = state.accounts2.map(a => Object.assign({}, a, { inUse: false }));
    let start = new Date();
    let end = new Date();
    end.setFullYear(end.getFullYear() + 1);

    var options = {
      currentDate: start,
      endDate: end
    };

    const ensureAccount = (accountName: string) => {
      let a = accounts.find(a => a.account === accountName);
      if (a != null) {
        a.inUse = true;
      } else {
        accounts.push({
          account: accountName,
          date: new Date(),
          balance: 0,
          inUse: true
        });
      }
    }

    // prone to causing duplicates. Needs a rethink.
    // TODO: Get last execution time of each schedule from the past ledger?
    let ledger = this.getPastLedger(state.ledger, start);
    let pastTranCount = ledger.length;

    if (ledger.length > 0) {
      for (let i = 0; i < ledger.length; i++) {
        ledger[i].sort = i - ledger.length;
        ledger[i].state = TranState.Executed;
      }

      const lastTran = ledger[ledger.length - 1];
      for (var acc of accounts) {
        if (acc.account in lastTran.balances) {
          acc.balance = lastTran.balances[acc.account];
        }
      }
    }

    log.debug("past ledger", pastTranCount, ledger);
    log.debug("accounts", accounts);

    for (const tran of state.schedule) {
      ensureAccount(tran.account);
      if (tran.isTransfer) {
        ensureAccount(tran.transferToAccount);
      }

      const thisOptions = Object.assign({}, options);
      log.debug("tran.selectedSchedule", tran.selectedSchedule);
      const since = tran.selectedSchedule.dateSince ?? start;
      const till = tran.selectedSchedule.dateTill ?? end;
      if (since > thisOptions.currentDate) {
        thisOptions.currentDate = addDays(since, -1);
      }
      if (till < thisOptions.endDate) {
        thisOptions.endDate = till;
      }
      const interval = CronParser.parseExpression(
        cronexpr(tran.selectedSchedule),
        thisOptions
      );
      while (true) {
        try {
          let tr = {
            sort: null,
            date: interval.next().toDate(),
            account: tran.account,
            amount: tran.amount,
            balances: {},
            description: tran.description,
            schedule: tran.selectedSchedule.label,
            isTransfer: tran.isTransfer,
            transferToAccount: tran.transferToAccount,
            state: TranState.Planned,
          };
          ledger.push(tr);
        } catch (e) {
          break;
        }
      }
    }

    let balances = {};
    for (let acc of accounts.filter(a => a.inUse)) {
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
      if (gtran.sort >= 0) {
        // if there is an inconsistency where the state does not have this transaction's account,
        // this code will break. May it break, so we can find a root cause.
        if (gtran.isTransfer) {
          if (typeof gtran.transferToAccount != "string" || gtran.transferToAccount.length == 0) {
            log.error("Target account is not set for a transfer transaction: ", gtran);
          }
          let amount = Math.abs(+gtran.amount);
          balances[gtran.account] -= amount;
          balances[gtran.transferToAccount] += amount;
        } else {
          balances[gtran.account] += +gtran.amount;
        }
        gtran.balances = Object.assign({}, balances);
      }
    }

    for (let i = pastTranCount; i < ledger.length; i++) {
      ledger[i].sort = (i - pastTranCount + 1);
    }

    log.debug("ledger generated", ledger);

    await this.tranActions.replaceLedger(ledger);
    await this.tranActions.replaceAccounts(accounts);
    log.debug("ea:ledger-changed", ledger.length, accounts.length);
    this.ea.publish("ledger-changed", ledger);
    return this.ledger;
  }

}

function cronexpr(sched: Schedule): string {
  return ["0", "0", ...sched.cron.slice(0, 3)].join(" ");
}

let addDays = function (date: Date, days: number) {
  var date = new Date(date.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
