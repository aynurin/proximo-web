import {
  ViewEngineHooks,
  View,
  bindable,
  inject,
  computedFrom,
} from "aurelia-framework";
import {EventAggregator} from 'aurelia-event-aggregator';
import {TranAddRequest, TranEditRequested} from './messages';
import cronstr from './components/cronstr'

@inject(EventAggregator)
export class TranScheduleCustomElement {
  @bindable editing: boolean = false;
  @bindable tran: TranSchedule = new TranSchedule();
  scheduleForm: any;
  @bindable accounts: string[] = [];


  public constructor(private ea: EventAggregator) { }
}

export class TranSchedule {
  date: number = null;
  month: Month = Month.Any;
  dayOfWeek: DayOfWeek = DayOfWeek.Any;
  year: number = null;
  holidayRule: HolidayRule = HolidayRule.Exact;
  amount: number = null;
  account: string = null;
  description: string = null;

  callcount: number = 0;

  @computedFrom('month', 'year')
  get maxDate(): number {
    return daysInMonth(this.month, this.year);
  }

  @computedFrom('date', 'month', 'dayOfWeek', 'year', 'holidayRule')
  get scheduleLabel(): string {
    let parts = [
      this.date !== null && this.date > 0 ? (this.date + 1).toString() : '*',
      this.month !== null && this.month !== Month.Any ? this.month.toString() : '*',
      this.dayOfWeek !== null && this.dayOfWeek !== DayOfWeek.Any ? this.dayOfWeek.toString() : '*',
      this.year !== null && this.year > 0 ? this.year.toString() : '*'
    ];
    return cronstr(parts);
  }

  get canSave(): boolean {
    return (
      this.amount !== null &&
      !isNaN(this.amount) &&
      this.account !== null &&
      this.account.length > 0 &&
      this.description !== null &&
      this.description.length > 0
    );
  }

  @computedFrom('date')
  get exactDateSelected(): boolean {
    return this.date !== null && this.date > 0;
  }

  @computedFrom('dayOfWeek')
  get exactWeekDaySelected(): boolean {
    return this.dayOfWeek !== null && this.dayOfWeek !== DayOfWeek.Any;
  }
}

export enum Month {
  Any = 0,
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December
}

export enum DayOfWeek {
  Any = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}

export enum HolidayRule {
  Exact,
  Before,
  After
}

// By convention, Aurelia will look for any classes of the form
// {name}ViewEngineHooks and load them as a ViewEngineHooks resource. We can
// use the @viewEngineHooks decorator instead if we want to give the class a
// different name.
export class TranScheduleViewEngineHooks implements ViewEngineHooks {
  // The `beforeBind` method is called before the ViewModel is bound to
  // the view. We want to expose the enum to the binding context so that
  // when Aurelia binds the data it will find our MediaType enum.
  beforeBind(view: View) {
    // We add the enum to the override context. This will expose the enum
    // to the view without interfering with any properties on the
    // bindingContext itself.
    view.overrideContext["Month"] = Month;

    // Since TypeScript enums are not iterable, we need to do a bit of extra
    // legwork if we plan on iterating over the enum keys.
    view.overrideContext["Months"] = Object.keys(Month).filter(
      key => typeof Month[key] === "number"
    );

    view.overrideContext["DayOfWeek"] = DayOfWeek;
    view.overrideContext["DaysOfWeek"] = Object.keys(DayOfWeek).filter(
      key => typeof DayOfWeek[key] === "number"
    );

    view.overrideContext["HolidayRule"] = HolidayRule;
    view.overrideContext["HolidayRules"] = Object.keys(HolidayRule).filter(
      key => typeof HolidayRule[key] === "number"
    );
  }
}

// https://stackoverflow.com/a/1184359/502818
// Month here is 1-indexed (January is 1, February is 2, etc). This is
// because we're using 0 as the day so that it returns the last day
// of the last month, so you have to add 1 to the month number 
// so it returns the correct amount of days
function daysInMonth (month:number, year:number = null):number {
  if (!year) {
    year = 1999;
  }
  return new Date(year, month, 0).getDate();
}
