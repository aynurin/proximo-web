import ColorProvider from "lib/ColorProvider";
import Account from "lib/model/Account";
import { ILedger } from "lib/model/Ledger";
import generateId from "lib/UUIDProvider";

jest.mock('lib/UUIDProvider');

const FAKE_COLOR = "fkeclr";

jest.mock("lib/ColorProvider");

describe('Account', () => {
  const colorProvider = new ColorProvider({ personId: null, accounts: null, introSteps: null });

  it('should create valid objects', () => {
    const newAccount = Account.createNew(colorProvider);
    newAccount.balance = 0;
    expect(generateId).toHaveBeenCalledTimes(1);
    expect(Account.isValid(newAccount)).toBe(true);
    expect(newAccount.colorCode).toBe(FAKE_COLOR);
  });

  it('should mark null as invalid', () => {
    expect(Account.isValid(null)).toBe(false);
  });

  it('should throw for concocted objects', () => {
    const newAccount = Account.createNew(colorProvider);
    delete newAccount._typeName;
    expect(() => Account.isValid(newAccount)).toThrow();
  });

  it('should throw for other types of objects', () => {
    const newAccount = Account.createNew(colorProvider);
    newAccount._typeName = "IInvalidType";
    expect(() => Account.isValid(newAccount)).toThrow();
  });

  it('should throw for non-numeric balance', () => {
    const newAccount = Account.createNew(colorProvider);
    newAccount.balance = "strange value" as unknown as number;
    expect(() => Account.isValid(newAccount)).toThrow();
  });

  it('should throw for NaN balance', () => {
    const newAccount = Account.createNew(colorProvider);
    newAccount.balance = NaN;
    expect(Account.isValid(newAccount)).toBe(false);
  });

  it('should shallow clone', () => {
    const ledger: ILedger = {
      transactions: null,
      dateUpdated: new Date()
    }
    const newAccount = Account.createNew(colorProvider);
    newAccount.ledger = ledger;
    const clone = Account.cloneState(newAccount);
    expect(clone).not.toBe(newAccount);
    expect(clone._typeName).toBe(newAccount._typeName);
    expect(clone.accountId).toBe(newAccount.accountId);
    expect(clone.colorCode).toBe(newAccount.colorCode);
    expect(clone.dateCreated).toBe(newAccount.dateCreated);
    expect(clone.ledger).toBe(newAccount.ledger);
  });

  it('should clone null', () => {
    expect(Account.cloneState(null)).toBeNull();
  });
});
