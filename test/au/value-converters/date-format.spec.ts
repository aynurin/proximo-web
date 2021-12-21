import { DateFormatValueConverter } from "au/value-converters/date-format";


test('should render date to view', () => {
  const converter = new DateFormatValueConverter();

  const date = new Date(2021, 11, 19, 3, 4, 5);
  const actual = converter.toView(date);
  const expected = "Dec 19, 2021";
  expect(actual).toEqual(expected);
});
