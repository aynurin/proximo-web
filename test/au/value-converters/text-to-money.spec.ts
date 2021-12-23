import { TextToMoneyValueConverter } from "au/value-converters/text-to-money";

//   private _parser = new NumberFormat();
  
//   toView(val: number) {
//     if (val == null) return null;
//     return this._parser.format(val);
//   }

//   fromView(val: string) {
//     if (!val) return null;
//     return this._parser.parse(val);
//   }
// }

describe('TextToMoneyValueConverter', () => {
  let converter: TextToMoneyValueConverter;

  beforeEach(() => {
    converter = new TextToMoneyValueConverter();
  });

  it('should render $0.00 in case of zero', () => {
    expect(converter.toView(0)).toBe("$0.00");
  });

  it('should render none in case of null', () => {
    expect(converter.toView(null)).toBe("");
  });

  it('should produce NaN if cannot parse', () => {
    expect(converter.fromView("asdf")).toBeNaN();
  });

  it('should produce NaN if null', () => {
    expect(converter.fromView(null)).toBeNaN();
  });

  it('should produce NaN if empty', () => {
    expect(converter.fromView('')).toBeNaN();
  });

  it('should ignore whitespace', () => {
    expect(converter.fromView("   34.45  ")).toBeCloseTo(34.45, 2);
  });

  it('should allow negative', () => {
    expect(converter.fromView("-34.45")).toBeCloseTo(-34.45, 2);
  });

  it('should allow group separator', () => {
    expect(converter.fromView("1,234.56")).toBeCloseTo(1234.56, 2);
  });

  it('should allow negative with whitespace', () => {
    expect(converter.fromView("- 34")).toBe(-34);
  });

  it('should allow floating point', () => {
    expect(converter.fromView("3.14")).toBeCloseTo(3.14, 2);
  });

  it('should allow currency symbol', () => {
    expect(converter.fromView("$3.14")).toBeCloseTo(3.14, 2);
  });
});
