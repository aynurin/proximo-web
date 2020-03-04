import { autoinject, noView, observable } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { Store } from "aurelia-store";
import { State } from "./state";
import { TranGenerated } from "model/tran-generated";
import { LogManager } from 'aurelia-framework';
import * as CronParser from "cron-parser";
import * as moment from "moment";
import { Schedule } from "model/schedule";
import { Subscription } from "rxjs";

const log = LogManager.getLogger('generate-ledger');

@noView()
@autoinject()
export class GenerateLedger {
    @observable public state: State;
    private subscription: Subscription;

    private ledger: TranGenerated[] = null;
    private ledgerVersion: number = null;

    bind() {
      this.subscription = this.store.state.subscribe(
        (state) => this.state = state
      );
    }
  
    unbind() {
      this.subscription.unsubscribe();
    }
    public constructor(public store: Store<State>, private ea: EventAggregator) {
    }

    stateChanged(stateName: string, newState: State, oldState: State) {
        this.onScheduleChanged();
    }

    public onScheduleChanged = (): TranGenerated[] => {
        log.debug("on-schedule-changed");
        if (this.state == null ||
            typeof this.state.schedule === 'undefined' ||
            this.state.schedule == null) {
            log.debug("state is empty", this.state);
            return [];
        }
        if (this.ledgerVersion != null && this.ledgerVersion === this.state.scheduleVersion) {
            log.debug("ledger is already generated for", this.state.scheduleVersion);
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

        log.debug("ledger-changed", ledger.length, ledger[2]);
        this.ea.publish("ledger-changed", ledger);
        this.ledger = ledger;
        this.ledgerVersion = this.state.scheduleVersion;
        return this.ledger;
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