import { firstOfTheMonth } from "./utils";

// https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore
export class DateFormat {
  private _locales: string[];
  private readonly _shortFormatter: Intl.DateTimeFormat;
  private readonly _fullFormatter: Intl.DateTimeFormat;
  private readonly _monthAndDateFormatter: Intl.DateTimeFormat;

  constructor(locales: string[] = null) {
    this._locales = locales ?? [];
    this._shortFormatter = this.formatter({ dateStyle: "medium" });
    this._fullFormatter = this.formatter({ dateStyle: "full" });
    this._monthAndDateFormatter = this.formatter({ month: "long", day: "numeric" });
  }
  
  private formatter(options: Intl.DateTimeFormatOptions = null): Intl.DateTimeFormat {
    options = options ?? { dateStyle: "medium" };
    return new Intl.DateTimeFormat(this._locales, options);
  }

  toHumanReadableShort(date: Date): string {
    return this._shortFormatter.format(date);
  }

  toShortMonthName(date: Date) {
    return this._shortFormatter.formatToParts(date).filter(p => p.type === "month")[0].value;
  }

  toParts(date: Date) {
    return this._fullFormatter.formatToParts(date);
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

  toFirstOfMonth(date: Date): Date {
    return firstOfTheMonth(date);
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
}
