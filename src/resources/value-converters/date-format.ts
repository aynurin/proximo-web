import * as moment from 'moment';

export class DateFormatValueConverter {
  toView(val: Date, format?: string) {
    if (!val) return null;
    if (format == null || format.trim() == "") {
      format = "MMMM Do YYYY";
    }
    return moment(val).format(format);
  }
}
