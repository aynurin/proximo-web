import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

import { TranGenerated } from "../model/tran-generated";

import { connectTo } from 'aurelia-store';
import { State } from '../state';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('ledger-grid');

const __cacheSec: number = 10;
@autoinject()
@connectTo()
export class LedgerGridCustomElement {
  public ledger: TranGenerated[] = null;
  public state: State;

  public constructor(
    ea: EventAggregator) {
      log.debug('subscribe to ledger');
      ea.subscribe("ledger-changed", (ledger: TranGenerated[]) => {
        log.debug('receiving new ledger');
        this.ledger = ledger;
      });
  }

  getRowStyleForTran(tran: TranGenerated) {
    if (tran.balances[tran.account] < 0) {
      return 'table-danger';
    } else if (tran.balances[tran.account] < 50) {
      return 'table-warning';
    }
  }

  objectValues(o: any): any[] {
    return Object.values(o);
  }
}
