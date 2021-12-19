import { NumberFormat } from "lib/NumberFormat";

export class TextToMoneyValueConverter {
  private _parser = new NumberFormat();
  
  toView(val: number) {
    if (val == null) return null;
    return this._parser.format(val);
  }

  fromView(val: string) {
    if (!val) return null;
    return this._parser.parse(val);
  }
}
