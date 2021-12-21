import { isNonEmptyString } from 'lib/utils';
// import numeral from 'numeral';

export class TextToFloatValueConverter {
  // toView(val: number) {
  //   if (!val) return null;
  //     return val.toString();
  // }

  fromView(val: string) {
    if (val != null && typeof val === 'string') {
      val = val.replace(/\s+/g, '');
    }
    return parseFloat(val);
  }
}
