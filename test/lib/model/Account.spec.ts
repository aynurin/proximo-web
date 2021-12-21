import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";

const FAKE_COLOR = "fkecde";
const FAKE_UUID = '468a0887-ebbc-4bd3-9371-ef84d54b996f';

jest.mock('lib/model/UUIDProvider', () => ({
  __esModule: true,
  default: jest.fn(() => FAKE_UUID),
}));

jest.mock("lib/ColorProvider");

describe('Account', () => {
  it('should create valid objects', () => {
    const colorProvider = new ColorProvider({ personId: null, accounts: null, introSteps: null });
    const newColorFn = jest.fn(() => FAKE_COLOR);
    colorProvider.newColor = newColorFn;

    const newAccount = Account.createNew(colorProvider);

    expect(newColorFn).toHaveBeenCalledTimes(1);
    expect(Account.isValid(newAccount)).toBe(true);
    expect(newAccount.colorCode).toBe(FAKE_COLOR);
    expect(newAccount.accountId).toBe(FAKE_UUID);
  });
});
