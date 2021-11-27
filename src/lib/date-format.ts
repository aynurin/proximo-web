

// https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore
export class DateFormat {
  private _locales: string[];
  private _formatter: Intl.DateTimeFormat;

  constructor(locales: string[] = null) {
    this._locales = locales ?? [];
    this._formatter = this.formatter();
  }
  
  private formatter(options: Intl.DateTimeFormatOptions = null): Intl.DateTimeFormat {
    options = options ?? { dateStyle: "medium" };
    return new Intl.DateTimeFormat(this._locales, options);
  }

  toHumanReadableShort(date: Date): string {
    console.debug('DateFormat.toHumanReadableShort', date, typeof date);
    return this._formatter.format(date);
  }

  toISODate(date: Date): string {
    if (date == null) {
      return "";
    }
    return date.toISOString().substring(0, 10);
  }

  toMonthKey(date: Date): string {
    return this.formatter({
      year: "numeric",
      month: "short"
    }).format(date);
  }
  toDateOfMonth(date: Date): string {
    return this.formatter({
      month: "long",
      day: "numeric"
    }).format(date);
  }
  toDate(date: Date): string {
    return date.getDate().toString();
  }
  toDayOfWeek(date: Date): string {
    return this.formatter({
      weekday: "long"
    }).format(date);
  }
  fromDateOfMonth(dateOfMonth: number): Date {
    var ref = new Date();
    return new Date(ref.getFullYear(), ref.getMonth(), dateOfMonth);
  }
}
