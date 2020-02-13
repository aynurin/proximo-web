import numeral from 'numeral';

export class TextToFloatValueConverter {
  // toView(val: number) {
  //   if (!val) return null;
  //     return val.toString();
  // }

  fromView(val: string) {
    if (!val) return null;
    return parseFloat(val);
  }
}
