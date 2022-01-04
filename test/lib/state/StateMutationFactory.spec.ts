import { Store } from "aurelia-store";
import { IPerson } from "lib/model/Person";
import { AccountActions } from "lib/state/AccountActions";
import { TimeTableActions } from "lib/state/TimeTableActions";
import { IntroActions } from "lib/state/IntroActions";
import { LedgerActions } from "lib/state/LedgerActions";
import StateMutationFactory from "lib/state/StateMutationFactory";

jest.mock('lib/UUIDProvider');
jest.mock("lib/ColorProvider");

describe('StateMutationFactory', () => {
  const initialState: IPerson = {
    personId: "1",
    accounts: null,
    introSteps: null
  }

  const store = new Store<IPerson>(initialState);
  const timetableActions = new TimeTableActions(store);
  const accountActions = new AccountActions(store);
  const introActions = new IntroActions(store);
  const ledgerActions = new LedgerActions(store);

  const stateFactory = new StateMutationFactory(store, 
    timetableActions, accountActions, introActions, ledgerActions);

  stateFactory.register();

  // coundn't figure out how to test with aurelia-store e2e
  it('should register all actions', () => {
    expect(store.isActionRegistered('addScheduled')).toBe(true);
    expect(store.isActionRegistered('replaceScheduled')).toBe(true);
    expect(store.isActionRegistered('removeScheduled')).toBe(true);

    expect(store.isActionRegistered('addAccount')).toBe(true);
    expect(store.isActionRegistered('updateAccount')).toBe(true);
    expect(store.isActionRegistered('removeAccount')).toBe(true);

    expect(store.isActionRegistered('addIntroState')).toBe(true);
    expect(store.isActionRegistered('addOrUpdateIntroState')).toBe(true);
    expect(store.isActionRegistered('updateIntroState')).toBe(true);
    expect(store.isActionRegistered('removeIntroState')).toBe(true);

    expect(store.isActionRegistered('mutateLedger')).toBe(true);
  });

  it('save should throw', () => {
    expect(async () => await stateFactory.save({})).rejects.toThrow();
  });
});
