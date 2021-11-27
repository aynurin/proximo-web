

// https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore
export class DateFormat {
  private _formatter: Intl.DateTimeFormat;

  constructor(locale = null) {
    this._formatter = new Intl.DateTimeFormat(locale ?? getLocale());
  }

  toHumanReadableShort(date: Date): string {
    return this._formatter.format(date);
  }

  toISODate(date: Date): string {
    return date.toISOString();
  }

  toMonthKey(date: Date): string {
    return date.getFullYear().toString() + date.getMonth().toString().padStart(2, '0');
  }

  parse(date: string): Date {
    throw new Error("Method not implemented.");
  }
  isValidDate(date: string): boolean {
    throw new Error("Method not implemented.");
  }
  toMonthDate(date: Date): string {
    throw new Error("Method not implemented.");
  }
  toDate(date: Date): string {
    throw new Error("Method not implemented.");
  }
  toDayOfWeek(date: Date): string {
    throw new Error("Method not implemented.");
  }
  dateFromCurrentMonth(monthDate: string): Date {
    throw new Error("Method not implemented.");
  }
}

function getLocale() {
  return navigator.languages[0];
}
