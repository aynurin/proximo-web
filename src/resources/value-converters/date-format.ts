import { DateFormat } from 'components/date-format';

export class DateFormatValueConverter {
  private dateFormatter = new DateFormat();
  toView(val: Date, format?: string) {
    if (!val) return null;
    if (format == null || format.trim() == "") {
      format = "MMMM Do YYYY";
    }
    return this.dateFormatter.toHumanReadableShort(val);
  }
}
