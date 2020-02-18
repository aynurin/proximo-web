import {
    bindable,
    autoinject,
    computedFrom
  } from "aurelia-framework";
  
  import { Store, connectTo } from 'aurelia-store';
  import { State } from './state';
  
  import { AccountBalance } from './model/account-balance';
  import { TranStateActions } from './model/tran-actions';
  
  @autoinject()
  @connectTo()
  export class AccountBalanceCustomElement {
    @bindable create: boolean = false;
    @bindable account: AccountBalance = { account: null, date: null, balance: null };
    accountBalanceForm: any;
    public state: State;
    private tranActions: TranStateActions;
  
    public constructor(private store: Store<State>) {
      this.tranActions = new TranStateActions(this.store);
      console.log('AccountBalanceCustomElement');
    }
  
    saveAccountBalance() {
      if (this.canSave) {
        this.tranActions.saveAccount(this.account);
        if (this.create) {
            this.account = { account: null, date: null, balance: null };
            this.accountBalanceForm.reset();
        }
      }
    }
  
    get canSave(): boolean {
      return (
        this.account != null &&
        this.account.account != null &&
        this.account.balance != null
      );
    }
  }
  