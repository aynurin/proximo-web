export class TextToIntValueConverter {
  // toView(val: number) {
  //   if (!val) return null;
  //     return val.toString();
  // }

  fromView(val: string) {
    if (!val) return null;
    return parseInt(val);
  }
}
