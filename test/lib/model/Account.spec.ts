import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";
import generateId from "lib/UUIDProvider";

jest.mock('lib/UUIDProvider');

const FAKE_COLOR = "fkeclr";

jest.mock("lib/ColorProvider");

describe('Account', () => {
  it('should create valid objects', () => {
    const colorProvider = new ColorProvider({ personId: null, accounts: null, introSteps: null });
    const newAccount = Account.createNew(colorProvider);

    expect(generateId).toHaveBeenCalledTimes(1);
    expect(Account.isValid(newAccount)).toBe(true);
    expect(newAccount.colorCode).toBe(FAKE_COLOR);
  });
});
