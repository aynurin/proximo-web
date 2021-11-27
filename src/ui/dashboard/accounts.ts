import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { Store, connectTo } from 'aurelia-store';

import { State } from "lib/state";

import { IntroContainer, IntroBuildingContext } from "lib/intro-building-context";

import { AccountBalance } from 'lib/model/account-balance';
import { TranStateActions } from 'lib/model/tran-actions';

const COMPONENT_NAME = "accounts";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class AccountsCustomElement {
  newAccForm: HTMLFormElement;
  @bindable newAccount: AccountBalance;
  public state: State;

  private htmlElement: HTMLElement;
  private intro: IntroContainer;

  public constructor(private store: Store<State>,
    private tranActions: TranStateActions,
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) {
  }

  created() {
    log.debug('created');
    this.reset();
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  readyForIntro() {
    log.debug("readyForIntro");
    this.intro.ready([{
      element: this.htmlElement,
      intro: `dashboard:intro.${COMPONENT_NAME}`,
      version: 1,
      priority: 20
    }]);
  }

  @computedFrom("state.schedule")
  get accounts(): AccountBalance[] {
    let existingAccounts = {};
    for (let account of this.state.accounts2) {
      existingAccounts[account.account] = account;
    }
    let accounts = {};
    for (let schedule of this.state.schedule) {
      if (!(schedule.account in accounts)) {
        if (schedule.account in existingAccounts) {
          accounts[schedule.account] = existingAccounts[schedule.account];
        } else {
          accounts[schedule.account] = { account: schedule.account, date: new Date(), balance: 0, inUse: true };
        }
      }
    }
    return Object.values(accounts);
  }

  async saveAccount(account: AccountBalance) {
    if (this.canSave(account)) {
      if (typeof account.balance === 'string') {
        account.balance = parseFloat(account.balance);
      }
      await this.tranActions.saveAccount(account);
      this.ea.publish('accounts-changed');
    }
  }

  attached() {
    log.debug("attached");
    this.readyForIntro();
  }

  reset() {
    this.newAccount = { account: null, date: null, balance: null, inUse: null };
  }

  async saveNewAccount() {
    await this.saveAccount(this.newAccount);
    this.reset();
    this.newAccForm.reset();
  }

  @computedFrom('newAccount', 'newAccount.account', 'newAccount.balance')
  get canSaveNewAccount(): boolean {
    return this.canSave(this.newAccount);
  }

  canSave(account: AccountBalance): boolean {
    return (
      account != null &&
      account.account != null &&
      account.balance != null
    );
  }
}
