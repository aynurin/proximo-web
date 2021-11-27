import cronstr from "../../../src/lib/cronstr";

describe("Cron String Converter", () => {
  it("17th of February", done => {
    const given = ['17', '2', '?', '*'];
    const expected = '17th of February';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("17th of the month", done => {
    const given = ['17', '*', '?', '*'];
    const expected = '17th of the month';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every Tuesday", done => {
    const given = ['?', '*', '2', '*'];
    const expected = 'Every Tuesday';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every Sunday", done => {
    const given = ['*', '*', '0', '*'];
    const expected = 'Every Sunday';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every Tuesday February through May", done => {
    const given = ['?', '2-5', '2', '*'];
    const expected = 'Every Tuesday, February through May';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every second Monday", done => {
    const given = ['?', '*', '1#2', '*'];
    const expected = 'Every second Monday';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("17th of February, 2020", done => {
    const given = ['17', '2', '?', '2020'];
    const expected = '17th of February, 2020';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every day in 2020", done => {
    const given = ['*', '*', '*', '2020'];
    const expected = 'Every day in 2020';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every day", done => {
    const given = ['*', '*', '*', '*'];
    const expected = 'Every day';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every Thursday of May", done => {
    const given = ['*', '5', '4', '*'];
    const expected = 'Every Thursday of May';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Third Thursday of May", done => {
    const given = ['*', '5', '4#3', '*'];
    const expected = 'Third Thursday of May';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
  it("Every other Thursday", done => {
    const given = ['*', '*', '4/2', '*'];
    const expected = 'Every other Thursday';
    const actual = cronstr(given);
    expect(actual).toBe(expected);
    done();
  });
});
