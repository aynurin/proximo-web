import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { connectTo } from 'aurelia-store';
import Person, { IPerson } from 'lib/model/Person';
import { IAccount } from 'lib/model/Account'
import { IPostedTransaction, TransactionState } from "lib/model/PostedTransaction";
import { IntroContainer, IntroBuildingContext } from "lib/intro-building-context";
import { waitFor } from "lib/utils";
import TimeTable from 'lib/model/TimeTable';
import { ILedger } from 'lib/model/Ledger';
import { ScheduleRenderer } from 'lib/view/ScheduleRenderer';

const COMPONENT_NAME = "ledger-grid";

const log = LogManager.getLogger(COMPONENT_NAME);

/**
 * LedgerGrid shows posted transactions and has the following features:
 *  - filter by account
 *  - filter by date
 *  - filter by description
 *  - reorder transactions
 */
@autoinject()
@connectTo()
export class LedgerGridCustomElement {
  public state: IPerson;
  private ledgerTable: HTMLTableElement;
  private ledger: ILedger;
  private intro: IntroContainer;

  private sortableOptions = {
    handle: '.drag-handle',
    draggable: '.draggable'
  }

  public constructor(
    private ea: EventAggregator,
    private introContext: IntroBuildingContext,
    private postingScheduleRenderer: ScheduleRenderer) { }

  created() {
    log.debug('created');
    this.ea.subscribe("ledger-changed", this.ledgerChanged);
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  attached() {
    log.debug('attached');
    waitFor(() => this.ledgerTable && this.ledgerTable.rows.length > 0, this.readyForIntro);
  }

  bind() {
    log.debug('bind');
    if (new Person(this.state).hasLedgers()) {
      this.ledgerChanged(this.state);
    }
  }

  /**
   * @todo: this has to be reworked after generate ledger is re-designed
   * @param person 
   */
  ledgerChanged = (person: IPerson) => {
    this.ledger = person.accounts[0].ledger;
  }

  readyForIntro = () => {
    log.debug("readyForIntro");
    this.intro.ready([{
      element: this.ledgerTable,
      intro: `ledger:${COMPONENT_NAME}.intro.default`,
      hint: null,
      version: 1,
      priority: 0
    }]);
  }

  getRowStyleForTran(tran: IPostedTransaction) {
    const styles = [TransactionState[tran.state].toString().toLowerCase()];
    if (tran.accountBalance < 0) {
      styles.push('danger');
    } else if (tran.accountBalance < 50) {
      styles.push('warning');
    }
    return styles.join(' ');
  }

  accountLabel(tran: IPostedTransaction): string {
    const scheduledTransaction = new TimeTable(new Person(this.state).getAccount(tran.accountId).timetable).getScheduled(tran.scheduledId);
    return this.postingScheduleRenderer.renderLabel(scheduledTransaction.schedule);
  }

  get accountsInUse(): IAccount[] {
    return this.state.accounts.filter(a => a.timetable.timetable.length > 0 || a.ledger.transactions.length > 0);
  }

  get pastLedger(): IPostedTransaction[] {
    const edge = this.ledger.transactions.findIndex(t => t.ledgerOrder > 0);
    return this.ledger.transactions.slice(0, edge);
  }

  get futureLedger(): IPostedTransaction[] {
    const edge = this.ledger.transactions.findIndex(t => t.ledgerOrder > 0);
    return this.ledger.transactions.slice(edge);
  }
}
