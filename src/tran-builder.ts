import {
  ViewEngineHooks,
  View,
  bindable,
  inject,
  computedFrom
} from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { TranAddRequest, TranEditRequested } from "./messages";
import cronstr from "./components/cronstr";
import * as moment from "moment";

@inject(EventAggregator)
export class TranBuilderCustomElement {
  @bindable editing: boolean = false;
  @bindable tran: TranBuilder = new TranBuilder();
  scheduleForm: any;
  @bindable accounts: string[] = [];

  public constructor(private ea: EventAggregator) {}

  clickme() {
  }

  addNewTran() {
    if (this.canSave) {
      // this.ea.publish(new TranAddRequest(Object.assign({}, this.tran)));
      this.ea.publish(new TranAddRequest(this.tran));
      this.tran = new TranBuilder();
      this.scheduleForm.reset();
    }
  }

  @computedFrom("tran.selectedSchedule")
  get showHolidayRule(): boolean {
    return this.tran && 
      this.tran.selectedSchedule && 
      this.tran.selectedSchedule.allowHolidayRule;
  }

  @computedFrom("tran.date")
  get allOptions(): Schedule[] {
    const options = [];

    const date = moment(this.tran.date);

    if (this.tran.date == null || this.tran.date == '') {
      return options;
    }

    options.push(
      new Schedule("Every " + moment(date).format("dddd"), false, {
        dayOfWeek: date.day() + 1
      })
    );

    options.push(
      new Schedule("Monthly, on the " + moment(date).format("Do"), true, {
        day: date.date()
      })
    );

    options.push(
      new Schedule("Once a year, on " + moment(date).format("MMM Do"), true, {
        day: date.date(),
        month: date.month() + 1
      })
    );

    options.push(
      new Schedule("Once, on " + moment(date).format("MMM Do YYYY"), true, {
        day: date.date(),
        month: date.month() + 1,
        year: date.year()
      })
    );

    return options;
  }

  get canSave(): boolean {
    return (
      this.tran &&
      this.tran.selectedSchedule != null &&
      this.tran.amount !== null &&
      !isNaN(this.tran.amount) &&
      this.tran.account !== null &&
      this.tran.account.length > 0 &&
      this.tran.description !== null &&
      this.tran.description.length > 0
    );
  }
}

export class TranBuilder {
  date: string = null;
  selectedSchedule: Schedule = null;

  amount: number = null;
  account: string = null;
  description: string = null;
}

interface CronParts {
  day?: number;
  month?: number;
  dayOfWeek?: number;
  year?: number;
  nthDayOfWeek?: number;
}

class Schedule {
  cron: string[];
  label: string;
  allowHolidayRule: boolean;
  holidayRule: HolidayRule = HolidayRule.on;

  constructor(label: string, allowHolidayRule: boolean, cron: CronParts) {
    this.cron = [
      cron.day == null || cron.day === NaN ? "*" : cron.day.toString(),
      cron.month == null || cron.month === NaN ? "*" : cron.month.toString(),
      cron.dayOfWeek == null || cron.dayOfWeek === NaN
        ? "*"
        : cron.nthDayOfWeek == null || cron.nthDayOfWeek === NaN
        ? cron.dayOfWeek.toString()
        : `${cron.dayOfWeek}#${cron.nthDayOfWeek}`,
      cron.year == null || cron.year === NaN ? "*" : cron.year.toString()
    ];
    this.label = label;
    this.allowHolidayRule = allowHolidayRule;
  }

  @computedFrom("cron")
  get id(): string {
    return this.cron.join('_').replace(/[#<>/-]/, '_');
  }

  @computedFrom("cron")
  get val(): string {
    return this.cron.join(' ');
  }

  @computedFrom("cron")
  get cronLabel(): string {
    let label = cronstr(this.cron);
    if (this.allowHolidayRule) {
      label += ', ' + HolidayRule[this.holidayRule] + ' holidays';
    }
    return label;
  }
}

export enum HolidayRule {
  on,
  before,
  after
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
    view.overrideContext["HolidayRule"] = HolidayRule;
    view.overrideContext["HolidayRules"] = Object.keys(HolidayRule).filter(
      key => typeof HolidayRule[key] === "number"
    );
  }
}
