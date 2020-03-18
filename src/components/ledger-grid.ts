import { autoinject } from "aurelia-framework";

import { TranGenerated } from "../model/tran-generated";

import { connectTo } from 'aurelia-store';
import { State } from '../state';
import { AccountBalance } from "model/account-balance";

@autoinject()
@connectTo()
export class LedgerGridCustomElement {
  public state: State;

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

  get accountsInUse(): AccountBalance[] {
    return this.state.accounts2.filter(a => a.inUse);
  }
}
