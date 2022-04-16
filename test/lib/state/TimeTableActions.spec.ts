import { Store } from "aurelia-store";
import Person, { IPerson } from "lib/model/Person";
import { AccountActions, updateState } from "lib/state/AccountActions";
import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";
import { TimeTableActions } from "lib/state/TimeTableActions";
import ScheduledTransaction from "lib/model/ScheduledTransaction";
import PostingSchedule from "lib/model/PostingSchedule";

jest.mock('lib/UUIDProvider');
jest.mock("lib/ColorProvider");

describe('TimeTableActions', () => {
  const colorProvider = new ColorProvider(() => []);

  const acc = Account.createNew(colorProvider);
  acc.friendlyName = "Account 1";

  const sch1 = ScheduledTransaction.createNew(acc.accountId, acc.friendlyName, PostingSchedule.createNew().weekly(1));
  const sch2 = ScheduledTransaction.createNew(acc.accountId, acc.friendlyName, PostingSchedule.createNew().weekly(2));
  const sch3 = ScheduledTransaction.createNew(acc.accountId, acc.friendlyName, PostingSchedule.createNew().weekly(3));
  const missingSch = ScheduledTransaction.createNew(acc.accountId, acc.friendlyName, PostingSchedule.createNew().weekly(4));

  acc.timetable = {
    timetable: [sch1, sch2],
    dateLastChanged: new Date()
  };

  const initialState: IPerson = {
    personId: "1",
    accounts: [acc],
    introSteps: null
  }

  const store = new Store<IPerson>(initialState);
  const actions = new TimeTableActions(store);

  actions.registerActions();

  // coundn't figure out how to test with aurelia-store e2e
  it('should register three actions', () => {
    expect(store.isActionRegistered('addScheduled')).toBe(true);
    expect(store.isActionRegistered('replaceScheduled')).toBe(true);
    expect(store.isActionRegistered('removeScheduled')).toBe(true);
  });

  it('actions.addScheduled should add a scheduled transaction', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc = p.accounts.find(a => a.accountId == acc.accountId);
          const newSch = newAcc.timetable.timetable.find(s => s.scheduledId === sch3.scheduledId);
          if (newSch != null) {
            expect(p).not.toBe(initialState);
            expect(newAcc).not.toBe(acc);
            expect(acc.timetable.timetable).toHaveLength(2);
            expect(newAcc.timetable.timetable).toHaveLength(3);
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
    actions.addScheduled(sch3).catch(done);
  });

  it('actions.replaceScheduled should replace a scheduled transaction', done => {
    const updSch2 = Object.assign({}, sch2);
    updSch2.schedule = PostingSchedule.createNew().monthly(12);
    
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc = p.accounts.find(a => a.accountId == acc.accountId);
          const newSch = newAcc.timetable.timetable.find(s => s.scheduledId === sch2.scheduledId);
          if (newSch._generation != sch2._generation) {
            expect(p).not.toBe(initialState);
            expect(newAcc).not.toBe(acc);
            expect(newSch).toBe(updSch2);
            expect(newSch).not.toBe(sch2);
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
    actions.replaceScheduled(updSch2).catch(done);
  });

  it('actions.removeScheduled should remove an scheduled transaction', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc = p.accounts.find(a => a.accountId == acc.accountId);
          const newSch = newAcc.timetable.timetable.find(s => s.scheduledId === sch1.scheduledId);
          if (newSch == null) {
            expect(p).not.toBe(initialState);
            expect(newAcc).not.toBe(acc);
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
    actions.removeScheduled(sch1).catch(done);
  });

  it('actions.addScheduled should reject on null', () => {
    expect(async () => {
      await actions.addScheduled(null);
    }).rejects.toThrow();
  });

  it('actions.replaceScheduled should reject on null', () => {
    expect(async () => {
      await actions.replaceScheduled(null);
    }).rejects.toThrow();
  });

  it('actions.removeScheduled should reject on null', () => {
    expect(async () => {
      await actions.removeScheduled(null);
    }).rejects.toThrow();
  });

  it('actions.replaceScheduled should reject missing accounts', () => {
    const updSch2 = Object.assign({}, sch2);
    updSch2.schedule = PostingSchedule.createNew().monthly(12);
    updSch2.accountId = "missing account id";
    expect(async () => {
      await actions.replaceScheduled(updSch2);
    }).rejects.toThrow();
  });
  it('actions.removeScheduled should reject missing scheduled transactions', () => {
    expect(async () => {
      await actions.removeScheduled(missingSch);
    }).rejects.toThrow();
  });

  it('actions.replaceScheduled should reject missing scheduled transactions', () => {
    expect(async () => {
      await actions.replaceScheduled(missingSch);
    }).rejects.toThrow();
  });

});
