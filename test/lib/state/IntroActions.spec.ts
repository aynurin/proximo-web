import { Store } from "aurelia-store";
import { IIntroState } from "lib/model/IntroState";
import { IPerson } from "lib/model/Person";
import { IntroActions } from "lib/state/IntroActions";

jest.mock('lib/UUIDProvider');
jest.mock("lib/ColorProvider");

describe('IntroActions', () => {
  const step1: IIntroState = { stepId: "1", versionCompleted: -1, completedDate: null };
  const step2: IIntroState = { stepId: "2", versionCompleted: -1, completedDate: null };
  const step3: IIntroState = { stepId: "3", versionCompleted: -1, completedDate: null };
  const step4: IIntroState = { stepId: "4", versionCompleted: -1, completedDate: null };
  const missingStep: IIntroState = { stepId: "99", versionCompleted: -1, completedDate: null };

  const initialState: IPerson = {
    personId: "1",
    accounts: null,
    introSteps: [ step1, step2 ]
  }

  const store = new Store<IPerson>(initialState);
  const actions = new IntroActions(store);
  let lastState: IPerson = null;

  actions.registerActions();

  // coundn't figure out how to test with aurelia-store e2e
  it('should register four actions', () => {
    expect(store.isActionRegistered('addIntroState')).toBe(true);
    expect(store.isActionRegistered('addOrUpdateIntroState')).toBe(true);
    expect(store.isActionRegistered('updateIntroState')).toBe(true);
    expect(store.isActionRegistered('removeIntroState')).toBe(true);
  });

  it('actions.addOrUpdateIntroStateAction should add a step', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc4 = p.introSteps.find(a => a.stepId == step4.stepId);
          if (newAcc4 != null) {
            expect(p).not.toBe(initialState);
            expect(p.introSteps.length).toBeGreaterThanOrEqual(3);
            s.unsubscribe();
            done();
          }
        } catch (error) {
          done(error);
        }
        lastState = p;
      },
      error: done,
      complete: () => {
        done("complete");
      }
    });
    if (lastState != null) {
      expect(lastState.introSteps.find(s => s.stepId == step4.stepId)).toBeUndefined();
    }
    actions.addOrUpdateIntroState(step4).catch(done);
  });

  it('actions.addOrUpdateIntroStateAction should update a step', done => {
    const updStep2 = Object.assign({}, step2);
    updStep2.versionCompleted = 888;
    
    let s = store.state.subscribe({
      next: p => {
        try {
          const newStep2 = p.introSteps.find(a => a.stepId == step2.stepId);
          if (newStep2.versionCompleted === 888) {
            expect(p).not.toBe(initialState);
            expect(newStep2).not.toBe(updStep2);
            expect(newStep2).not.toBe(step2);
            expect(newStep2.versionCompleted).toBe(888);
            s.unsubscribe();
            done();
          }
        } catch (error) {
          done(error);
        }
        lastState = p;
      },
      error: done,
      complete: () => {
        done("complete");
      }
    });
    if (lastState != null) {
      expect(lastState.introSteps.find(s => s.stepId == step2.stepId)).not.toBeNull();
      expect(lastState.introSteps.find(s => s.stepId == step2.stepId).versionCompleted).not.toBe(888);
    }
    actions.addOrUpdateIntroState(updStep2).catch(done);
  });

  it('actions.addIntroState should add a step', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newAcc3 = p.introSteps.find(a => a.stepId == step3.stepId);
          if (newAcc3 != null) {
            expect(p).not.toBe(initialState);
            expect(p.introSteps.length).toBeGreaterThanOrEqual(3);
            s.unsubscribe();
            done();
          }
        } catch (error) {
          done(error);
        }
        lastState = p;
      },
      error: done,
      complete: () => {
        done("complete");
      }
    });
    if (lastState != null) {
      expect(lastState.introSteps.find(s => s.stepId == step3.stepId)).toBeUndefined();
    }
    actions.addIntroState(step3).catch(done);
  });

  it('actions.updateIntroState should update a step', done => {
    const updStep2 = Object.assign({}, step2);
    updStep2.versionCompleted = 999;
    
    let s = store.state.subscribe({
      next: p => {
        try {
          const newStep2 = p.introSteps.find(a => a.stepId == step2.stepId);
          if (newStep2.versionCompleted === 999) {
            expect(p).not.toBe(initialState);
            expect(newStep2).not.toBe(updStep2);
            expect(newStep2).not.toBe(step2);
            expect(newStep2.versionCompleted).toBe(999);
            s.unsubscribe();
            done();
          }
        } catch (error) {
          done(error);
        }
        lastState = p;
      },
      error: done,
      complete: () => {
        done("complete");
      }
    });
    if (lastState != null) {
      expect(lastState.introSteps.find(s => s.stepId == step2.stepId)).not.toBeNull();
      expect(lastState.introSteps.find(s => s.stepId == step2.stepId).versionCompleted).not.toBe(999);
    }
    actions.updateIntroState(updStep2).catch(done);
  });

  it('actions.removeIntroState should remove a step', done => {
    let s = store.state.subscribe({
      next: p => {
        try {
          const newStep1 = p.introSteps.find(a => a.stepId == step1.stepId);
          if (newStep1 == null) {
            s.unsubscribe();
            done();
          }
        } catch (error) {
          done(error);
        }
        lastState = p;
      },
      error: done,
      complete: () => {
        done("complete");
      }
    });
    if (lastState != null) {
      expect(lastState.introSteps.find(s => s.stepId == step1.stepId)).not.toBeNull();
    }
    actions.removeIntroState(step1).catch(done);
  });

  it('actions.addOrUpdateIntroState should reject on null', () => {
    expect(async () => {
      await actions.addOrUpdateIntroState(null);
    }).rejects.toThrow();
  });

  it('actions.addIntroState should reject on null', () => {
    expect(async () => {
      await actions.addIntroState(null);
    }).rejects.toThrow();
  });

  it('actions.updateIntroState should reject on null', () => {
    expect(async () => {
      await actions.updateIntroState(null);
    }).rejects.toThrow();
  });

  it('actions.removeIntroState should reject on null', () => {
    expect(async () => {
      await actions.removeIntroState(null);
    }).rejects.toThrow();
  });

  it('actions.removeIntroState should reject missing steps', () => {
    expect(async () => {
      await actions.removeIntroState(missingStep);
    }).rejects.toThrow();
  });

  it('actions.updateIntroState should reject missing steps', () => {
    expect(async () => {
      await actions.updateIntroState(missingStep);
    }).rejects.toThrow();
  });
});
