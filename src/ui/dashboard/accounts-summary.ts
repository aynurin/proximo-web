import {
  bindable,
  autoinject,
} from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { connectTo } from 'aurelia-store';

import { DateFormat, firstOfTheMonth } from "lib/DateFormat";

import Person, { IPerson } from 'lib/model/Person';
import { IntroBuildingContext, IntroContainer } from "lib/intro-building-context";
import { AccountHealth, IAccount } from "lib/model/Account";
import CustomError from "lib/model/CustomError";
import { TransactionsPostedOnDate, IPostedTransaction, MapOfTransactionsPostedOnDate } from "lib/model/PostedTransaction";
import Ledger from "lib/model/Ledger";

const COMPONENT_NAME = "accounts-summary";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class AccountsSummaryCustomElement {
  newAccForm: HTMLFormElement;
  @bindable newAccount: IAccount;
  public state: IPerson;
  private person: Person;
  private dateFormatter = new DateFormat();

  public months: Date[];
  public accountsByMonth: MonthlyAggregateGroup[];
  public totalsByMonth: MonthlyAggregateGroup;

  private htmlElement: HTMLElement;

  private intro: IntroContainer;

  constructor(
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.ea.subscribe("ledger-changed", () => this.ledgerChanged());
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  readyForIntro() {
    log.debug("readyForIntro");
    this.intro.ready([{ 
      element: this.htmlElement, 
      intro: `dashboard:intro.${COMPONENT_NAME}`, 
      hint: null,
      version: 1,
      priority: 20 }]);
  }

  bind() {
    log.debug('bind');
    if (this.state) {
      this.person = new Person(this.state);
    }
    if (this.person && this.person.hasSchedules()) {
      this.generateTable(this.state);
    }
  }

  attached() {
    log.debug('attached');
  }

  ledgerChanged = () => {
    log.debug('ledgerChanged');
    this.generateTable(this.state);
  }

  // when data is changed - need to update datasets
  generateTable = (state: IPerson) => {
    if (!state) {
      throw new CustomError("generateTable called with null state");
    }
    log.debug('generateTable');

    const accountsSummary: MonthlyAggregateGroup[] = state.accounts.map(account => ({
      key: account,
      aggregates: new Ledger(account.ledger).groupByDate(t => firstOfTheMonth(t.datePosted))
    }));

    accountsSummary.map(a => a.aggregates.keys()).flat()

    // get only unique dates from the accountsSummary
    const months = Array.from(
      new Set(
        accountsSummary.map(
          a => Array.from(a.aggregates.keys())
        ).flat()
      ).keys()
    ).sort();

    const totals: MonthlyAggregateGroup = { key: null, aggregates: new Map<number, TransactionsPostedOnDate>() };

    for (const month of months) {
      // get all transactions on all accounts for this date
      totals.aggregates.set(month, 
        TransactionsPostedOnDate.combine(accountsSummary.map(a => a.aggregates.get(month)).filter(t => t !== undefined).flat()));
    }

    this.months = months.map(m => new Date(m));
    this.accountsByMonth = accountsSummary;
    this.totalsByMonth = totals;

    this.readyForIntro();
  }

  monthName(date: Date) {
    return this.dateFormatter.toShortMonthName(date);
  }

  accountHealth(transactions: TransactionsPostedOnDate): AccountHealth {
    if (transactions.low[0].accountBalance < 0) {
      return AccountHealth.Danger;
    } else if (transactions.totalSpend + transactions.totalIncome < 0) {
      return AccountHealth.Warning;
    }
    return AccountHealth.Healthy;
  }

  accountCSS(transactions: TransactionsPostedOnDate): string {
    return this.accountHealth(transactions).toString().toLowerCase();
  }

  tryGet(date: Date, monthly: MonthlyAggregateGroup, accessor: (transactionAggregate: TransactionsPostedOnDate) => string): string {
    if (monthly.aggregates.has(date.valueOf())) {
      return accessor(monthly.aggregates.get(date.valueOf()));
    } else {
      return "";
    }
  }
}

type MonthlyAggregateGroup = {
  key: IAccount;
  aggregates: MapOfTransactionsPostedOnDate;
};
