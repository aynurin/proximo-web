// https://observablehq.com/@mbostock/localized-number-parsing
export class NumberFormat {
  private _group: RegExp;
  private _decimal: RegExp;
  private _numeral: RegExp;
  private _index: (substring: string, ...args: any[]) => string;
  private _locale: string;
  private _formatter: Intl.NumberFormat;

  constructor(locale = null) {
    this._locale = locale ?? getLocale();
    this._formatter = new Intl.NumberFormat(this._locale);

    const format = new Intl.NumberFormat(this._locale);
    const parts = format.formatToParts(12345.6);
    const numerals = Array.from({ length: 10 }).map((_, i) => format.format(i));
    const index = new Map(numerals.map((d, i) => [d, i]));
    
    this._group = new RegExp(`[${parts.find(d => d.type === "group").value}]`, "g");
    this._decimal = new RegExp(`[${parts.find(d => d.type === "decimal").value}]`);
    this._numeral = new RegExp(`[${numerals.join("")}]`, "g");
    this._index = d => index.get(d).toString();
  }

  parse(val: string) {
    return (val = val.trim()
      .replace(this._group, "")
      .replace(this._decimal, ".")
      .replace(this._numeral, this._index)) ? +val : NaN;
  }

  format(val: number) {
    return this._formatter.format(val);
  }
}

function getLocale() {
  return navigator.languages[0];
}
