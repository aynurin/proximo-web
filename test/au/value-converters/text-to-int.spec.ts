import { TextToIntValueConverter } from "au/value-converters/text-to-int";

describe('TextToIntValueConverter', () => {
  let converter: TextToIntValueConverter;

  beforeEach(() => {
    converter = new TextToIntValueConverter();
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
    expect(converter.fromView("   34  ")).toBe(34);
  });

  it('should allow negative', () => {
    expect(converter.fromView("-34")).toBe(-34);
  });

  it('should allow negative with whitespace', () => {
    expect(converter.fromView("- 34")).toBe(-34);
  });

  it('should allow floating point', () => {
    expect(converter.fromView("3.14")).toBe(3);
  });
});
