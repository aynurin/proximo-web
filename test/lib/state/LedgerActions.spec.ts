import { Store } from "aurelia-store";
import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";
import { IPerson } from "lib/model/Person";
import { LedgerActions } from "lib/state/LedgerActions";

jest.mock('lib/UUIDProvider');
jest.mock("lib/ColorProvider");

describe('LedgerActions', () => {
  const colorProvider = new ColorProvider({ personId: null, accounts: null, introSteps: null });
  
  const acc = Account.createNew(colorProvider);

  acc.friendlyName = "Account 1";

  acc.ledger = {
    transactions: [],
    dateUpdated: new Date()
  };

  const wrongAcc = Account.createNew(colorProvider);

  wrongAcc.friendlyName = "Wrong Account";

  wrongAcc.ledger = acc.ledger;

  const initialState: IPerson = {
    personId: "1",
    accounts: [acc],
    introSteps: null
  }

  const store = new Store<IPerson>(initialState);
  const actions = new LedgerActions(store);

  actions.registerActions();

  // coundn't figure out how to test with aurelia-store e2e
  it('should register one action', () => {
    expect(store.isActionRegistered('mutateLedger')).toBe(true);
  });

  it('actions.mutateLedger should mutate the ledger on the right account', done => {
    const updLedger = {
      transactions: [null],
      dateUpdated: new Date()
    }
    
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc = p.accounts.find(a => a.accountId == acc.accountId);
          const newLedger = newAcc.ledger;
          if (newLedger.transactions.length == 1) {
            expect(p).not.toBe(initialState);
            expect(newAcc).not.toBe(acc);
            expect(newLedger).not.toBe(acc.ledger);
            expect(newLedger).not.toBe(updLedger);
            expect(acc.ledger.transactions).toHaveLength(0);
            s.unsubscribe();
            done();
          }
        } catch (error) {
          done(error);
        }
      },
      error: done,
      complete: () => {
        done("complete");
      }
    })
    actions.mutateLedger(acc, updLedger).catch(done);
  });

  it('actions.mutateLedger should reject missing accounts', () => {
    const updLedger = {
      transactions: [null],
      dateUpdated: new Date()
    }

    expect(async () => {
      await actions.mutateLedger(wrongAcc, updLedger);
    }).rejects.toThrow();
  });

  it('actions.mutateLedger should reject on ledger=null', () => {
    expect(async () => {
      await actions.mutateLedger(acc, null);
    }).rejects.toThrow();
  });

  it('actions.mutateLedger should reject on account=null', () => {
    const updLedger = {
      transactions: [null],
      dateUpdated: new Date()
    }

    expect(async () => {
      await actions.mutateLedger(null, updLedger);
    }).rejects.toThrow();
  });

});
