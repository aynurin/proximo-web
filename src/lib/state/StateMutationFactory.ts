import { TimeTableActions } from './TimeTableActions';
import { IntroActions } from './IntroActions';
import { AccountActions } from './AccountActions';
import { autoinject } from 'aurelia-framework';
import { Store } from 'aurelia-store';
import { IPerson } from 'lib/model/Person';
import { LedgerActions } from './LedgerActions';
import { IChangeSet } from 'lib/model/ChangeSet';


@autoinject
export default class StateMutationFactory {

  public constructor(
    private readonly store: Store<IPerson>,
    public readonly timeTableActions: TimeTableActions,
    public readonly accountActions: AccountActions,
    public readonly introActions: IntroActions,
    public readonly ledgerActions: LedgerActions) {}

  public register() {
    this.timeTableActions.registerActions();
    this.accountActions.registerActions();
    this.introActions.registerActions();
    this.ledgerActions.registerActions();
  }

  async save(changeSet: IChangeSet) {
    await Promise.resolve();
    throw new Error("Method not implemented.");
  }
}
