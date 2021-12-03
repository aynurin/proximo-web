import { TimeTableActionsActions } from './TimeTableActions';
import { IntroActions } from './IntroActions';
import { AccountActions } from './AccountActions';
import { autoinject } from 'aurelia-framework';
import { Store } from 'aurelia-store';
import { IPerson } from 'lib/model/Person';
import { LedgerActions } from './LedgerActions';


@autoinject
export default class StateMutationFactory {

  public constructor(
    private readonly store: Store<IPerson>,
    private readonly timeTableActions: TimeTableActionsActions,
    private readonly accountActions: AccountActions,
    private readonly introActions: IntroActions,
    private readonly ledgerActions: LedgerActions) {}

  public register() {
    this.timeTableActions.registerActions();
    this.accountActions.registerActions();
    this.introActions.registerActions();
    this.ledgerActions.registerActions();
  }
}
