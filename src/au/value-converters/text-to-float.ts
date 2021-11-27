// import numeral from 'numeral';

export class TextToFloatValueConverter {
  // toView(val: number) {
  //   if (!val) return null;
  //     return val.toString();
  // }

  fromView(val: string) {
    if (!val) return null;
    if (val.trim() == '-') return val;
    try {
      return parseFloat(val);
    } catch {
      return null;
    }
  }
}
