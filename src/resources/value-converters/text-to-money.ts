// import numeral from 'numeral';

export class TextToMoneyValueConverter {
  // toView(val: number) {
  //   if (!val) return null;
  //     return numeral(val).format('0,0.00');
  // }

  fromView(val: string) {
    if (!val) return null;
    return parseFloat(val);
    // return numeral(val).value();
  }
}
