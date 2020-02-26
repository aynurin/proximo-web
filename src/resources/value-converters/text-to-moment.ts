import * as moment from 'moment';

export class TextToMomentValueConverter {
  fromView(val: string) {
    return moment(val);
  }
}
