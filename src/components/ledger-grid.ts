import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { connectTo } from 'aurelia-store';
import { State } from '../state';
import { AccountBalance } from "model/account-balance";
import { TranScheduleWrapper, TranGenerated } from "model/tran-template";
import { IntroContainer, IntroBuildingContext } from "./intro-building-context";
import { waitFor } from "./utils";

const COMPONENT_NAME = "ledger-grid";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class LedgerGridCustomElement {
  public state: State;
  private htmlElement: HTMLTableElement;
  private intro: IntroContainer;

  public constructor(
    private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  attached() {
    waitFor(() => this.htmlElement && this.htmlElement.rows.length > 0, this.readyForIntro);
  }

  readyForIntro = () => {
    log.debug("readyForIntro");
    this.intro.ready([{
      element: this.htmlElement,
      intro: `ledger:${COMPONENT_NAME}.intro.default`,
      version: 1,
      priority: 0
    }]);
  }

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
