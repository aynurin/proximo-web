import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { connectTo } from "aurelia-store";

import Person, { IPerson } from "lib/model/Person";

import ScheduledTransaction, { IScheduledTransaction } from "lib/model/ScheduledTransaction";
import StateMutationFactory from 'lib/state/StateMutationFactory';
import PostingSchedule from "lib/model/PostingSchedule";
import Account, { IAccount } from "lib/model/Account";
import ColorProvider from "lib/ColorProvider";

const log = LogManager.getLogger('welcome');

@autoinject()
@connectTo()
export class WelcomeCustomElement {
  tran1 = new WelcomeScreenTransaction();
  tran2 = new WelcomeScreenTransaction();
  tran3 = new WelcomeScreenTransaction();
  tran4 = new WelcomeScreenTransaction();
  tran5 = new WelcomeScreenTransaction();
  addedTrans: WelcomeScreenTransaction[] = [];
  welcomeForm: HTMLFormElement;
  public state: IPerson;
  person: Person;

  public constructor(
    private tranActions: StateMutationFactory,
    private ea: EventAggregator,
    private colorProvider: ColorProvider) { }

  get canSave(): boolean {
    const toSave = this.getTransactionsToSave();
    return toSave !== false && toSave.length > 0;
  }

  attached() {
    log.debug("attached");
  }

  activate() {
    this.person = new Person(this.state);
  }

  getTransactionsToSave(): WelcomeScreenTransaction[] | false {
    const allTrans = [this.tran1, this.tran2, this.tran3, this.tran4, this.tran5, ...this.addedTrans];
    const toSave: WelcomeScreenTransaction[] = [];
    for (const tran of allTrans) {
      if (tran != null && tran.isRequired && !tran.isValid) {
        return false;
      }
      if (tran != null && tran.isValid) {
        toSave.push(tran);
      }
    }
    return toSave;
  }

  addMore() {
    this.addedTrans.push(new WelcomeScreenTransaction());
  }

  /**
   * @todo: refactor vanilla account schedule creation
   */
  async saveSchedule() {
    const toSave = this.getTransactionsToSave();
    if (toSave !== false && toSave.length > 0) {
      if (this.person.person.accounts.length == 0) {
        const newAccount = Account.createNew(this.colorProvider);
        newAccount.balance = 0;
        newAccount.friendlyName = "My Bank Account";
        await this.tranActions.accountActions.addAccount(newAccount);
      }
      const account = this.person.person.accounts[0];
      const trans = toSave.map(t => this.createSchedule(account, t));
      //await this.tranActions.accountActions.replaceAccounts([]);
      for (const tran of trans) {
        await this.tranActions.timeTableActions.addScheduled(tran);
      }
      this.ea.publish("state-hydrated");
      this.tran1 = new WelcomeScreenTransaction();
      this.tran2 = new WelcomeScreenTransaction();
      this.tran3 = new WelcomeScreenTransaction();
      this.tran4 = new WelcomeScreenTransaction();
      this.tran5 = new WelcomeScreenTransaction();
      this.addedTrans = [];
      if (this.welcomeForm) {
        this.welcomeForm.reset();
      }
    }
  }

  createSchedule(account: IAccount, tran: WelcomeScreenTransaction): IScheduledTransaction {
    const dateOfMonth = parseInt(tran.monthDate);
    const scheduled = ScheduledTransaction.createNew(account.accountId, account.friendlyName, PostingSchedule.createNew().monthly(dateOfMonth));
    scheduled.amount = parseInt(tran.amount);
    scheduled.description = tran.description;
    return scheduled;
  }
}

export class WelcomeScreenTransaction {
  amount: string;
  monthDate: string;
  description: string;

  get isRequired(): boolean {
    return (this.amount && this.amount != "") ||
      (this.monthDate && this.monthDate != "") ||
      (this.description && this.description != "")
  }

  get isValid(): boolean {
    const floatAmount = parseFloat(this.amount);
    const intDate = parseInt(this.monthDate);
    return (this.amount && this.amount != "" && floatAmount != 0 && !isNaN(floatAmount)) ||
      (this.monthDate && this.monthDate != "" && intDate >= 1 && intDate <= 31 && !isNaN(intDate)) ||
      (this.description && this.description != "")
  }
}
