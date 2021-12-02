import { DateFormat } from 'lib/date-format';

describe("DateFormat", () => {
  const formatter = new DateFormat(["en-US"]);

  it("toHumanReadableShort", done => {
    const given = new Date(2021, 3, 28);
    const expected = 'Apr 28, 2021';
    const actual = formatter.toHumanReadableShort(given);
    expect(actual).toBe(expected);
    done();
  });
  it("toHumanReadableShort: not finite", done => {
    const given = new Date("2021-02-19T08:00:00.000Z");
    const expected = 'Feb 19, 2021';
    const actual = formatter.toHumanReadableShort(given);
    expect(actual).toBe(expected);
    done();
  });
  it("toISODate", done => {
    const given = new Date(2021, 3, 28);
    const expected = '2021-04-28';
    const actual = formatter.toISODate(given);
    expect(actual).toBe(expected);
    done();
  });
  it("toMonthKey", done => {
    const given = new Date(2021, 3, 28);
    const expected = 'Apr 2021';
    const actual = formatter.toMonthKey(given);
    expect(actual).toBe(expected);
    done();
  });
  it("toDateOfMonth", done => {
    const given = new Date(2021, 3, 28);
    const expected = 'April 28';
    const actual = formatter.toDateOfMonth(given);
    expect(actual).toBe(expected);
    done();
  });
  it("toDate", done => {
    const given = new Date(2021, 3, 28);
    const expected = '28';
    const actual = formatter.toDate(given);
    expect(actual).toBe(expected);
    done();
  });
  it("toDayOfWeek", done => {
    const given = new Date(1984, 1, 18);
    const expected = 'Saturday';
    const actual = formatter.toDayOfWeek(given);
    expect(actual).toBe(expected);
    done();
  });
  it("fromDateOfMonth", done => {
    const given = "4";
    const ref = new Date();
    const expected = new Date(ref.getFullYear(), ref.getMonth(), 4);
    const actual = formatter.fromDateOfMonth(parseInt(given));
    expect(actual).toStrictEqual(expected);
    done();
  });
});
