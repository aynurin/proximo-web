import * as moment from 'moment';

export class DateFormatValueConverter {
  toView(val: Date) {
    if (!val) return null;
    return moment(val).format("MMMM Do YYYY");
  }
}
