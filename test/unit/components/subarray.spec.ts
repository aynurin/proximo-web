import { subarray, edgeSearch } from "../../../src/lib/subarray";

describe("SubArray", () => {
  it("subarray-100: subarray regular case", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const lowEdge = i => i > 2;
    const highEdge = i => i < 5;
    const expected = [3, 3, 4, 4];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-110: subarray nose on the edge 1", done => {
    const given = [4, 4, 5, 6];
    const lowEdge = i => i >= 3;
    const highEdge = i => i < 5;
    const expected = [4, 4];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-110: subarray nose on the edge 2", done => {
    const given = [3, 4, 4, 5, 6];
    const lowEdge = i => i >= 3;
    const highEdge = i => i < 5;
    const expected = [3, 4, 4];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-120: subarray tail on the edge 1", done => {
    const given = [1, 2, 2, 3, 3];
    const lowEdge = i => i >= 3;
    const highEdge = i => i < 4;
    const expected = [3, 3];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-125: subarray tail on the edge 2", done => {
    const given = [1, 2, 2, 3, 3, 4];
    const lowEdge = i => i >= 3;
    const highEdge = i => i < 4;
    const expected = [3, 3];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-130: subarray out of bounds", done => {
    const given = [1, 2, 2, 3, 3];
    const lowEdge = i => i >= 5;
    const highEdge = i => i < 10;
    const expected = [];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-140: subarray catch tail", done => {
    const given = [1, 2, 2, 3, 3];
    const lowEdge = i => i >= 3;
    const highEdge = i => i < 10;
    const expected = [3, 3];
    const actual = subarray(given, lowEdge, highEdge);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-200: edgeSearch left", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const searcher = i => i < 3;
    const expected = given.findIndex(v => v == 3) - 1;
    const actual = edgeSearch(given, searcher);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-210: edgeSearch left with start boundary and no edge", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const searcher = i => i < 3;
    const startFrom = 5;
    const expected = given.slice(startFrom).findIndex(searcher);
    const actual = edgeSearch(given, searcher, startFrom);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-220: edgeSearch left with start boundary and no edge but all true", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const searcher = i => i > 3;
    const startFrom = 5;
    const expected = -2;
    const actual = edgeSearch(given, searcher, startFrom);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-300: edgeSearch right", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const searcher = i => i > 4;
    const expected = given.findIndex(v => v == 5);
    const actual = edgeSearch(given, searcher);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-310: edgeSearch right with end boundary and no edge", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const searcher = i => i > 4;
    const endsWith = 5;
    const expected = given.slice(0, endsWith).findIndex(searcher);
    const actual = edgeSearch(given, searcher, undefined, endsWith);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-320: edgeSearch right with end boundary and no edge but all true", done => {
    const given = [1, 2, 2, 3, 3, 4, 4, 5, 6];
    const searcher = i => i < 4;
    const endsWith = 5;
    const expected = -2;
    const actual = edgeSearch(given, searcher, undefined, endsWith);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-400: edgeSearch all true", done => {
    const given = [1, 2, 3];
    const searcher = _ => true;
    const expected = -2;
    const actual = edgeSearch(given, searcher);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-410: edgeSearch from doc", done => {
    const given = [1, 1, 1, 2, 2, 2];
    const searcher = x => x == 2
    const expected = given.findIndex(searcher);
    const actual = edgeSearch(given, searcher);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-500: edgeSearch no edge and all false", done => {
    const given = [1, 2, 3];
    const searcher = i => false;
    const expected = given.findIndex(searcher);
    const actual = edgeSearch(given, searcher);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-600: edgeSearch foolproof out of bounds", done => {
    const given = [1, 2, 3];
    const searcher = i => true;
    const startFrom = given.length;
    const expected = given.slice(startFrom).findIndex(searcher);
    const actual = edgeSearch(given, searcher, startFrom);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-605: edgeSearch foolproof out of bounds", done => {
    const given = [1, 2, 3];
    const searcher = _ => true;
    const startFrom = given.length + 100;
    const expected = given.slice(startFrom).findIndex(searcher);
    const actual = edgeSearch(given, searcher, startFrom);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-620: edgeSearch foolproof no edge and all true", done => {
    const given = [1, 2, 3];
    const searcher = _ => true;
    const endsWith = given.length + 100;
    const expected = -2;
    const actual = edgeSearch(given, searcher, undefined, endsWith);
    expect(actual).toEqual(expected);
    done();
  });
  it("subarray-630: edgeSearch foolproof null array", done => {
    const searcher = i => true;
    const expected = -1;
    const actual = edgeSearch(null, searcher);
    expect(actual).toEqual(expected);
    done();
  });
});
