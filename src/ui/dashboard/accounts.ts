import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { Store, connectTo } from 'aurelia-store';

import { IPerson } from "lib/model/Person"

import { IntroContainer, IntroBuildingContext } from "lib/intro-building-context";

import Account, { IAccount } from "lib/model/Account"
import StateMutationFactory from 'lib/state/StateMutationFactory';
import ColorProvider from 'lib/ColorProvider';

const COMPONENT_NAME = "accounts";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class AccountsCustomElement {
  newAccForm: HTMLFormElement;
  @bindable newAccount: IAccount;
  public state: IPerson;

  private htmlElement: HTMLElement;
  private intro: IntroContainer;

  public constructor(private store: Store<IPerson>,
    private tranActions: StateMutationFactory,
    private ea: EventAggregator,
    private introContext: IntroBuildingContext,
    private colorProvider: ColorProvider) {
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
      hint: null,
      version: 1,
      priority: 20
    }]);
  }

  async saveAccount(account: IAccount) {
    if (this.canSave(account)) {
      await this.tranActions.accountActions.updateAccount(account);
      this.ea.publish('accounts-changed');
    }
  }

  attached() {
    log.debug("attached");
    this.readyForIntro();
  }

  reset() {
    this.newAccount = Account.createNew(this.colorProvider);
  }

  async saveNewAccount() {
    await this.saveAccount(this.newAccount);
    this.reset();
    this.newAccForm.reset();
  }

  @computedFrom('newAccount', 'newAccount.friendlyName', 'newAccount.balance')
  get canSaveNewAccount(): boolean {
    return this.canSave(this.newAccount);
  }

  canSave(account: IAccount): boolean {
    return Account.isValid(account);
  }
}
