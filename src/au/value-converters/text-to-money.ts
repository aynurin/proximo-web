import { NumberFormat } from "lib/NumberFormat";

/**
 * @todo: This should use an actual Money data type, not a float
 */
export class TextToMoneyValueConverter {
  private parser = new NumberFormat();
  private moneyFormatter = new Intl.NumberFormat([], { style: 'currency', currency: 'USD' });
  
  toView(val: number) {
    if (val == null) return "";
    return this.moneyFormatter.format(val);
  }

  fromView(val: string) {
    if (val != null && typeof val === 'string') {
      val = val.replace(/\s+|^[^-\d\\.]+|\D+$/g, '');
    }
    return this.parser.parse(val);
  }
}
