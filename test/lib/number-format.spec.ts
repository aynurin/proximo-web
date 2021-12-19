import { NumberFormat } from 'lib/NumberFormat';

describe("NumberFormat", () => {
  const formatter = new NumberFormat(["en-US"]);

  it("parse", done => {
    const given = '453,635.35';
    const expected = 453635.35;
    const actual = formatter.parse(given);
    expect(actual).toBe(expected);
    done();
  });
  it("format", done => {
    const given = 453635.3456;
    const expected = '453,635.35';
    const actual = formatter.format(given);
    expect(actual).toBe(expected);
    done();
  });
});
