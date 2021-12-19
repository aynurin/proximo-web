import { IScheduledTransaction } from 'lib/model/ScheduledTransaction';
import { I18N } from "aurelia-i18n";
import Person, { IPerson } from "lib/model/Person";
import { IPostedTransaction } from 'lib/model/PostedTransaction';

export class AccountRenderer {
  person: Person;
  constructor(public readonly state: IPerson, private i18next: I18N) {
    this.person = new Person(this.state);
  }
  
  renderScheduledAccountLabel(scheduled: IScheduledTransaction): string {
    return this.accountLabel(this.person.getAccount(scheduled.accountId).friendlyName,
    scheduled.transferToAccountId == null ? null : this.person.getAccount(scheduled.transferToAccountId).friendlyName);
  }
  
  renderPostedAccountLabel(posted: IPostedTransaction): string {
    return this.accountLabel(this.person.getAccount(posted.accountId).friendlyName,
      posted.transferToAccountId == null ? null : this.person.getAccount(posted.transferToAccountId).friendlyName);
  }

  accountLabel(accountFriendlyName: string, transferToAccountFriendlyName: string) {
    if (transferToAccountFriendlyName == null) {
      return accountFriendlyName;
    } else {
      return accountFriendlyName + " <i class=\"fa fa-angle-double-right\"></i> " + transferToAccountFriendlyName;
    }
  }

}

