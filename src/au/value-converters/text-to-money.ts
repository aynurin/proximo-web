import { NumberFormat } from "lib/NumberFormat";

/**
 * @todo: This should use an actual Money data type, not a float
 */
export class TextToMoneyValueConverter {
  private _parser = new NumberFormat();
  
  toView(val: number) {
    if (val == null) return null;
    return this._parser.format(val);
  }

  fromView(val: string) {
    if (val != null && typeof val === 'string') {
      val = val.replace(/\s+|^[^-\d\\.]+|\D+$/g, '');
    }
    return this._parser.parse(val);
  }
}
