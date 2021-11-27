import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { connectTo } from 'aurelia-store';
import { State } from 'lib/state';
import { AccountBalance } from "lib/model/account-balance";
import { TranScheduleWrapper, TranGenerated, TranState } from "lib/model/tran-template";
import { IntroContainer, IntroBuildingContext } from "lib/intro-building-context";
import { waitFor } from "lib/utils";

const COMPONENT_NAME = "ledger-grid";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class LedgerGridCustomElement {
  public state: State;
  private ledgerTable: HTMLTableElement;
  private ledger: TranGenerated[];
  private intro: IntroContainer;

  private sortableOptions: any = {
    handle: '.drag-handle',
    draggable: '.draggable'
  }

  public constructor(
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) { }

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
    if (this.state && this.state.ledger && this.state.ledger.length > 0) {
      this.ledgerChanged(this.state.ledger);
    }
  }

  ledgerChanged = (ledger: TranGenerated[]) => {
    this.ledger = ledger;
  }

  readyForIntro = () => {
    log.debug("readyForIntro");
    this.intro.ready([{
      element: this.ledgerTable,
      intro: `ledger:${COMPONENT_NAME}.intro.default`,
      version: 1,
      priority: 0
    }]);
  }

  getRowStyleForTran(tran: TranGenerated) {
    let styles: String[] = [TranState[tran.state].toString().toLowerCase()];
    if (tran.balances[tran.account] < 0) {
      styles.push('danger');
    } else if (tran.balances[tran.account] < 50) {
      styles.push('warning');
    }
    return styles.join(' ');
  }

  accountLabel(tran: TranGenerated): string {
    return (new TranScheduleWrapper(tran).accountLabel);
  }

  objectValues(o: any): any[] {
    return Object.values(o);
  }

  get accountsInUse(): AccountBalance[] {
    return this.state.accounts2.filter(a => a.inUse);
  }

  get pastLedger(): TranGenerated[] {
    let edge = this.ledger.findIndex(t => t.sort > 0);
    return this.ledger.slice(0, edge);
  }

  get futureLedger(): TranGenerated[] {
    let edge = this.ledger.findIndex(t => t.sort > 0);
    return this.ledger.slice(edge);
  }
}
