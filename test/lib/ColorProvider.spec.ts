import ColorProvider from "lib/ColorProvider";

describe("ColorProvider", () => {
  it("returns colors", done => {
    const colorProvider = new ColorProvider(() => []);
    const color = colorProvider.newColor();
    expect(color && typeof color === 'string').toBe(true);
    expect(color).toHaveLength(6);
    done();
  });
  it("toHumanReadableShort: not finite", done => {
    expect(() => {
      const colorAccumulator: string[] = [];
      const colorProvider = new ColorProvider(() => colorAccumulator);
      for (var i = 0; i < 11; i++) {
        colorAccumulator.push(colorProvider.newColor());
      }
    }).toThrow("No more colors left.");
    done();
  });
});
