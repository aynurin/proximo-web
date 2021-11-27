import { DateFormat } from 'lib/date-format';

export class DateFormatValueConverter {
  private dateFormatter = new DateFormat();
  toView(val: Date) {
    if (!val) return null;
    return this.dateFormatter.toHumanReadableShort(val);
  }
}
