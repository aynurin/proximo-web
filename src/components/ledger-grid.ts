import { autoinject } from "aurelia-framework";

import { connectTo } from 'aurelia-store';
import { State } from '../state';
import { AccountBalance } from "model/account-balance";
import { TranScheduleWrapper, TranGenerated } from "model/tran-template";

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

  accountLabel(tran: TranGenerated): string {
    return (new TranScheduleWrapper(tran).accountLabel);
  }

  objectValues(o: any): any[] {
    return Object.values(o);
  }

  get accountsInUse(): AccountBalance[] {
    return this.state.accounts2.filter(a => a.inUse);
  }
}
