import * as moment from 'moment';

export class TextToMomentValueConverter {
  // toView(val: Date) {
  //   if (!val) return null;
  //   console.log('TextToMoment.toView', val, moment(val).format("YYYY-MM-DD"));
  //   return moment(val).format("YYYY-MM-Do");
  // }

  fromView(val: string) {
    return moment(val);
  }
}
