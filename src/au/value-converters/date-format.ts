import { DateFormat } from 'lib/DateFormat';

export class DateFormatValueConverter {
  private dateFormatter = new DateFormat();
  toView(val: Date) {
    if (!val) return "";
    return this.dateFormatter.toHumanReadableShort(val);
  }
}
