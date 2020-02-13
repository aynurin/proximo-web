import {
  ViewEngineHooks,
  View,
  bindable,
  inject,
} from "aurelia-framework";
import {EventAggregator} from 'aurelia-event-aggregator';
import {TranAddRequest, TranEditRequested} from './messages';
import cronstrue from 'cronstrue';

@inject(EventAggregator)
export class TranScheduleCustomElement {
  @bindable editing: boolean = false;
  @bindable tran: TranSchedule = new TranSchedule();
  scheduleForm: any;
  @bindable accounts: string[] = [];


  public constructor(private ea: EventAggregator) { }

  addNewTran() {
    console.log(this.scheduleForm);
    if (this.tran.canSave) {
      // this.ea.publish(new TranAddRequest(Object.assign({}, this.tran)));
      this.ea.publish(new TranAddRequest(this.tran));
      this.tran = new TranSchedule();
      this.scheduleForm.reset();
    }
  }
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

  get maxDate(): number {
    return daysInMonth(this.month, this.year);
  }

  get scheduleLabel(): string {
    // every 4th
    // of july
    // every Tuesday
    // 2002
    // last business day before | first business day after |
    let parts = ['*', '*'];
    if (this.date !== null && this.date >= 0) {
      parts.push(this.date.toString())
    } else {
      console.log('date null', this.date);
      parts.push('*');
    }
    console.log('month', this.month);
    if (this.date !== null && this.date >= 0) {
      parts.push(this.date.toString())
    } else {
      console.log('date null', this.date);
      parts.push('*');
    }
    // if (this.month !== null && this.month !== Month.Any) {
    //   parts.push(this.month.toString())
    // } else {
    //   console.log('month null', this.month);
    //   parts.push('*');
    // }
    // if (this.dayOfWeek !== null && this.dayOfWeek !== DayOfWeek.Any) {
    //   parts.push(this.dayOfWeek.toString())
    // } else {
    //   console.log('dayOfWeek null', this.dayOfWeek);
    //   parts.push('*');
    // }
    // if (this.year !== null && this.year > 0) {
    //   parts.push(this.year.toString())
    // } else {
    //   console.log('year null', this.year);
    //   parts.push('*');
    // }
    const cron = parts.join(' ');
    console.log(cron);
    return ""
    // return cronstrue.toString(cron);
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
