import { TrimSpaceValueConverter } from "au/value-converters/trim-space";

describe('TrimSpaceValueConverter', () => {
  let converter: TrimSpaceValueConverter;

  beforeEach(() => {
    converter = new TrimSpaceValueConverter();
  });

  it('should trim spaces on ends', () => {
    expect(converter.fromView("   akldsafj askdfj asd jf \r\n\t  ")).toBe("akldsafj askdfj asd jf");
  });
});
