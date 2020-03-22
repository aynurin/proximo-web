import {
    bindable,
    autoinject,
    computedFrom
  } from "aurelia-framework";
  import { EventAggregator } from "aurelia-event-aggregator";
  
  import { Store, connectTo } from 'aurelia-store';
  import { State } from '../state';
  
  import { AccountBalance } from '../model/account-balance';
  import { TranStateActions } from '../model/tran-actions';
  
  @autoinject()
  @connectTo()
  export class AccountsCustomElement {
    newAccForm: HTMLFormElement;
    @bindable newAccount: AccountBalance;
    public state: State;
  
    public constructor(private store: Store<State>,
      private tranActions: TranStateActions, 
      private ea: EventAggregator) {
      this.reset();
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
  