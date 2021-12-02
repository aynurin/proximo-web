// https://observablehq.com/@mbostock/localized-number-parsing
export class NumberFormat {
  private _group: RegExp;
  private _decimal: RegExp;
  private _numeral: RegExp;
  private _index: (substring: string, ...args: any[]) => string;
  private _locales: string[];
  private _formatter: Intl.NumberFormat;

  constructor(locales: string[] = null) {
    this._locales = locales ?? [];
    this._formatter = new Intl.NumberFormat(this._locales, { notation: "standard", maximumFractionDigits: 2 });

    const parts = this._formatter.formatToParts(12345.6);
    const numerals = Array.from({ length: 10 }).map((_, i) => this._formatter.format(i));
    const index = new Map(numerals.map((d, i) => [d, i]));
    
    this._group = new RegExp(`[${parts.find(d => d.type === "group").value}]`, "g");
    this._decimal = new RegExp(`[${parts.find(d => d.type === "decimal").value}]`);
    this._numeral = new RegExp(`[${numerals.join("")}]`, "g");
    this._index = d => index.get(d).toString();
  }

  parse(val: string) {
    val = val.trim()
      .replace(this._group, "")
      .replace(this._decimal, ".")
      .replace(this._numeral, this._index)
    return val ? +val : NaN;
  }

  format(val: number) {
    return this._formatter.format(val);
  }
}
