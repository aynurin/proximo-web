import { createEmptyState } from "lib/state/emptyState";
import { isNonEmptyString } from "lib/utils";

jest.mock('lib/UUIDProvider');

describe('emptyState', () => {
  const emptyState = createEmptyState();

  // coundn't figure out how to test with aurelia-store e2e
  it('should be valid', () => {
    expect(isNonEmptyString(emptyState.personId)).toBe(true);
    expect(emptyState.accounts).not.toBeNull();
    expect(emptyState.accounts).toHaveLength(0);
    expect(emptyState.introSteps).not.toBeNull();
    expect(emptyState.introSteps).toHaveLength(0);
  });
});
