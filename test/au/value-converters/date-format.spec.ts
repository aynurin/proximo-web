import { DateFormatValueConverter } from "au/value-converters/date-format";


describe('DateFormatValueConverter', () => {
  const converter = new DateFormatValueConverter();

  test('should render date to view', () => {
    const actual = converter.toView(new Date(2021, 11, 19, 3, 4, 5));
    expect(actual).toEqual("Dec 19, 2021");
  });

  test('should render empty string for null', () => {
    const actual = converter.toView(null);
    expect(actual).toEqual("");
  });
});
