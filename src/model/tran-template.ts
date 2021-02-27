import {
  computedFrom
} from "aurelia-framework";
import { Schedule } from "./schedule";

export interface ITransaction {
  amount: number;
  account: string;
  description: string;
  isTransfer: boolean;
  transferToAccount: string;
}

export class TranTemplate implements ITransaction {
  date: string = null;
  selectedSchedule: Schedule = null;

  amount: number = null;
  account: string = null;
  description: string = null;
  
  transferToAccount: string = null;
  
  isTransfer: boolean = false;
}

export class TranGenerated implements ITransaction {
  sort: number = null;
  date: Date = null;
  amount: number = null;
  account: string = null;
  description: string = null;
  balances: any = null;
  isTransfer: boolean = null;
  transferToAccount: string = null;
  state: TranState = null;
}

export enum TranType {
  Deposit = 1,
  Withdrawal,
  Transfer
}

export enum TranState {
  Planned = 0,
  Processing = 1,
  Executed = 2,
  Deleted = 3
}

export class TranScheduleWrapper<T extends ITransaction> {
  constructor(public value: T) {}
  
  @computedFrom("tranType", "value.account", "value.transferToAccount")
  get accountLabel(): string {
    if (this.tranType == TranType.Transfer) {
      return `${this.value.account} <i class="fa fa-angle-double-right"></i> ${this.value.transferToAccount}`;
    } else {
      return this.value.account;
    }
  }

  @computedFrom("value.isTransfer", "value.amount")
  get tranType(): TranType {
    let ttype = 0 as TranType;
    if (this.value.isTransfer) {
      ttype = TranType.Transfer;
    } else if (this.value.amount > 0) {
      ttype = TranType.Deposit;
    } else if (this.value.amount < 0) {
      ttype = TranType.Withdrawal;
    }
    return ttype;
  }

  set tranType(type: TranType) {
    if (this.value instanceof TranGenerated) {
      throw Error("Invalid assignment to readonly data");
    }
    this.value.isTransfer = false;
    if (type == TranType.Deposit) {
      this.value.amount = Math.abs(this.value.amount);
    } else if (type == TranType.Withdrawal) {
      this.value.amount = -Math.abs(this.value.amount);
    } else if (type == TranType.Transfer) {
      this.value.isTransfer = true;
      this.value.amount = Math.abs(this.value.amount);
    } else {
      this.value.amount = 0;
    }
  }

  @computedFrom("value.selectedSchedule", "value.amount", "value.account", "value.isTransfer", "value.transferToAccount", "value.description")
  get isValid(): boolean {
    if (!(this.value instanceof TranTemplate)) {
      return true;
    }
    const tran = this.value as TranTemplate;
    if (tran == null) {
      return false;
    }
    if (tran.selectedSchedule == null) {
      return false;
    }
    if (tran.amount == null || isNaN(tran.amount) || tran.amount.toString() == "" || tran.amount == 0) {
      return false;
    }
    if (tran.account == null || tran.account.trim().length == 0) {
      return false;
    }
    if (this.tranType == TranType.Transfer) {
      if (tran.transferToAccount == null || tran.transferToAccount.trim().length == 0) {
        return false;
      }
      if (tran.transferToAccount === tran.account) {
        return false;
      }
    }
    if (tran.description == null || tran.description.trim().length == 0) {
      return false;
    }
    return true;
  }
}
