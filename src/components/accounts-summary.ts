import {
  bindable,
  observable,
  autoinject,
} from "aurelia-framework";

import { connectTo } from 'aurelia-store';
import { State } from '../state';

import { AccountBalance } from '../model/account-balance';
import { pluck } from "rxjs/operators";
import { TranGenerated } from "model/tran-generated";
import * as moment from "moment";
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('accounts-summary');

@autoinject()
@connectTo<State>((store) => store.state.pipe(pluck('ledger')))
export class AccountsSummaryCustomElement {
  newAccForm: HTMLFormElement;
  @bindable newAccount: AccountBalance;
  @observable public state: TranGenerated[];

  public byMonths: AccountByMonths[];
  public months: string[];
  public totals: AccountByMonths;

  attached() {
    log.debug('attached');
    this.stateChanged();
  }
  
  stateChanged = () => {
    if (!this.state) {
      return;
    }
    const l_months: string[] = [];
    const l_totals: AccountByMonths = { account: "totals", months: {}, endingBalance: -1 };

    const l_byMonth = this.state.reduce((x: { [account: string]: AccountByMonths }, item) => {
      if (!(item.account in x)) {
        x[item.account] = { account: item.account, months: {}, endingBalance: -1 };
      }
      let month = moment(item.date).format("YYYY-MM-02");
      if (l_months.length == 0 || l_months[l_months.length - 1] != month) {
        l_months.push(month);
      }
      let balance = item.balances[item.account];
      let acc = x[item.account];
      if (!(month in acc.months)) {
        acc.months[month] = new AccountMonth(item.account, month);
      }
      acc.months[month].add(item.account, month, item.amount, balance);
      acc.endingBalance = balance;
      if (!(month in l_totals.months)) {
        l_totals.months[month] = new AccountMonth(l_totals.account, month);
      }
      l_totals.months[month].add(l_totals.account, month, item.amount, balance);
      l_totals.endingBalance = balance;
      return x;
    }, {});
    
    this.byMonths = Object.values(l_byMonth);
    this.months = l_months;
    this.totals = l_totals;
  }

  monthName(month: string) {
    return moment(month).format("MMMM");
  }
}

interface AccountByMonths {
  account: string;
  months: { [month: string]: AccountMonth; };
  endingBalance: number;
}

class AccountMonth {
  account: string;
  month: string;
  low: number = NaN;
  ending: number = NaN;
  spend: number = 0;
  income: number = 0;

  constructor(account: string, month: string) {
    this.account = account;
    this.month = month;
    this.low = NaN;
    this.ending = NaN;
    this.spend = 0;
    this.income = 0;
  }

  add(account: string, month: string, amount: number, resultingBalance: number) {
    if (account != this.account || month != this.month) {
      throw new Error(`Provided account or month do not match this consumer: ${account} (${this.account}), ${month} (${this.month})`);
    }
    if (isNaN(this.low) || resultingBalance < this.low) {
      this.low = +resultingBalance;
    }
    this.ending = +resultingBalance;
    if (amount < 0) {
      this.spend += +amount;
    } else {
      this.income += +amount;
    }
  }

  get status(): string {
    if (this.low < 0 || this.ending < 0) {
      return "danger";
    } else if (this.spend + this.income < 0) {
      return "warning";
    }
  }
}

interface TranMonth {
  account: string;
  month: number;
  amount: number;
  balance: number;
}