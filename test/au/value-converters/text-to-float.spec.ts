import { TextToFloatValueConverter } from "au/value-converters/text-to-float";

describe('TextToFloatValueConverter', () => {
  let converter: TextToFloatValueConverter;

  beforeEach(() => {
    converter = new TextToFloatValueConverter();
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

  it('should allow negative with whitespace', () => {
    expect(converter.fromView("- 34.45")).toBeCloseTo(-34.45, 2);
  });
});
