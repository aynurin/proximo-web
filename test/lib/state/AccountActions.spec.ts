import { Store } from "aurelia-store";
import Person, { IPerson } from "lib/model/Person";
import { AccountActions, updateState } from "lib/state/AccountActions";
import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";

jest.mock('lib/UUIDProvider');
jest.mock("lib/ColorProvider");

describe('AccountActions', () => {
  const colorProvider = new ColorProvider({ personId: null, accounts: null, introSteps: null });

  const acc1 = Account.createNew(colorProvider);
  const acc2 = Account.createNew(colorProvider);
  const acc3 = Account.createNew(colorProvider);
  const missingAcc = Account.createNew(colorProvider);

  acc1.friendlyName = "Account 1";
  acc2.friendlyName = "Account 2";
  acc3.friendlyName = "Account 3";
  missingAcc.friendlyName = "Missing Account";

  const initialState: IPerson = {
    personId: "1",
    accounts: [acc1, acc2],
    introSteps: null
  }

  const store = new Store<IPerson>(initialState);
  const actions = new AccountActions(store);

  actions.registerActions();

  // coundn't figure out how to test with aurelia-store e2e
  it('should register three actions', () => {
    expect(store.isActionRegistered('addAccount')).toBe(true);
    expect(store.isActionRegistered('updateAccount')).toBe(true);
    expect(store.isActionRegistered('removeAccount')).toBe(true);
  });

  it('actions.addAccount should add an account', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc3 = p.accounts.find(a => a.accountId == acc3.accountId);
          if (newAcc3 != null) {
            expect(p).not.toBe(initialState);
            expect(p.accounts).toHaveLength(3);
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
    actions.addAccount(acc3).catch(done);
  });

  it('actions.updateAccount should update an account', done => {
    const updAcc2 = Object.assign({}, acc2);
    updAcc2.friendlyName = "Peanut butter";
    
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc2 = p.accounts.find(a => a.accountId == acc2.accountId);
          if (newAcc2._generation > updAcc2._generation) {
            expect(p).not.toBe(initialState);
            expect(newAcc2).not.toBe(updAcc2);
            expect(newAcc2).not.toBe(acc2);
            expect(newAcc2.friendlyName).toBe("Peanut butter");
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
    actions.updateAccount(updAcc2).catch(done);
  });

  it('actions.removeAccount should remove an account', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc1 = p.accounts.find(a => a.accountId == acc1.accountId);
          if (newAcc1 == null) {
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
    actions.removeAccount(acc1).catch(done);
  });

  it('actions.addAccount should reject on null', () => {
    expect(async () => {
      await actions.addAccount(null);
    }).rejects.toThrow();
  });

  it('actions.updateAccount should reject on null', () => {
    expect(async () => {
      await actions.updateAccount(null);
    }).rejects.toThrow();
  });

  it('actions.removeAccount should reject on null', () => {
    expect(async () => {
      await actions.removeAccount(null);
    }).rejects.toThrow();
  });

  it('actions.removeAccount should reject missing accounts', () => {
    expect(async () => {
      await actions.removeAccount(missingAcc);
    }).rejects.toThrow();
  });

  it('actions.updateAccount should reject missing accounts', () => {
    expect(async () => {
      await actions.updateAccount(missingAcc);
    }).rejects.toThrow();
  });

});
