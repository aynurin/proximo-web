import { autoinject, noView, observable } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { Store } from "aurelia-store";

import * as CronParser from "cron-parser";
import * as moment from "moment";
import { Subscription } from "rxjs";

import { State } from "./state";

import { Schedule } from "model/schedule";
import { TranStateActions } from "model/tran-actions";
import { TranGenerated } from "model/tran-template";

const log = LogManager.getLogger('generate-ledger');

@noView()
@autoinject()
export class GenerateLedger {
    @observable public state: State;
    private subscription: Subscription;

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

        let ledger: TranGenerated[] = [];
        for (const tran of state.schedule) {
            ensureAccount(tran.account);
            if (tran.isTransfer) {
                ensureAccount(tran.transferToAccount);
            }

            const thisOptions = Object.assign({}, options);
            const since = getBestDate(start, tran.selectedSchedule.dateSince);
            const till = getBestDate(end, tran.selectedSchedule.dateTill);
            if (since > moment(thisOptions.currentDate)) {
                thisOptions.currentDate = since.add(-1, 'days').toDate();
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
                        schedule: tran.selectedSchedule.label,
                        isTransfer: tran.isTransfer,
                        transferToAccount: tran.transferToAccount,
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
            // if there is an inconsistency where the state does not have this transaction's account,
            // this code will break. May it break, so we can find a root cause.
            if (gtran.isTransfer) {
                let amount = Math.abs(+gtran.amount);
                balances[gtran.account] -= amount;
                balances[gtran.transferToAccount] += amount;
            } else {
                balances[gtran.account] += +gtran.amount;
            }
            gtran.balances = Object.assign({}, balances);
        }

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

function getBestDate(one: Date, another: Date | string) {
    if (another == null || another.toString().trim() == "") {
        return moment(one);
    } else {
        return moment(another);
    }
}
