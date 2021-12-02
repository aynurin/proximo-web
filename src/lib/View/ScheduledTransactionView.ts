import {
  computedFrom
} from "aurelia-framework";
import Person from "lib/model/Person";
import ScheduledTransaction, { IScheduledTransaction } from "lib/model/ScheduledTransaction";

enum TranType {
  Deposit = 1,
  Withdrawal,
  Transfer
}

export class ScheduledTransactionView {
  constructor(public readonly person: Person, public readonly scheduled: IScheduledTransaction) {}
  
  @computedFrom("tranType", "value.account", "value.transferToAccount")
  get accountLabel(): string {
    if (this.tranType == TranType.Transfer) {
      return this.person.getAccount(this.scheduled.accountId).friendlyName
        + " <i class=\"fa fa-angle-double-right\"></i> "
        + this.person.getAccount(this.scheduled.transferToAccountId).friendlyName;
    } else {
      return this.person.getAccount(this.scheduled.accountId).friendlyName;
    }
  }

  @computedFrom("value.isTransfer", "value.amount")
  get tranType(): TranType {
    let ttype = 0 as TranType;
    if (this.scheduled.transferToAccountId != null) {
      ttype = TranType.Transfer;
    } else if (this.scheduled.amount > 0) {
      ttype = TranType.Deposit;
    } else if (this.scheduled.amount < 0) {
      ttype = TranType.Withdrawal;
    }
    return ttype;
  }

  set tranType(transactionType: TranType) {
    if (transactionType === TranType.Transfer && this.scheduled.transferToAccountId == null)  {
      throw Error("Cannot set type to transfer without transferToAccountId");
    }
    if (transactionType == TranType.Deposit || transactionType == TranType.Transfer) {
      this.scheduled.amount = Math.abs(this.scheduled.amount);
    } else if (transactionType == TranType.Withdrawal) {
      this.scheduled.amount = -Math.abs(this.scheduled.amount);
    }
  }

  @computedFrom("value.selectedSchedule", "value.amount", "value.account", "value.isTransfer", "value.transferToAccount", "value.description")
  get isValid(): boolean { return ScheduledTransaction.isValid(this.scheduled); }
}
