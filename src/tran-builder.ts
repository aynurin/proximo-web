import {
  ViewEngineHooks,
  View,
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import cronstr from "./components/cronstr";
import * as moment from "moment";

import { Store, connectTo } from 'aurelia-store';
import { State } from './state';

import { Schedule, HolidayRule } from './model/schedule';
import { TranTemplate } from './model/tran-template';
import { TranStateActions } from './model/tran-actions';

@autoinject()
@connectTo()
export class TranBuilderCustomElement {
  @bindable editing: boolean = false;
  @bindable tran: TranTemplate = new TranTemplate();
  scheduleForm: any;
  @bindable accounts: string[] = [];
  public state: State;
  private tranActions: TranStateActions;

  public constructor(private store: Store<State>) {
    this.tranActions = new TranStateActions(this.store);
  }

  clickme() {
    if (this.tran) {
      console.log('clickme', this.tran.selectedSchedule);
    }
  }

  addNewTran() {
    if (this.canSave) {
      this.tranActions.addTran(this.tran);
      this.tran = new TranTemplate();
      this.scheduleForm.reset();
    }
  }

  removeTran(tran: TranTemplate) {
    this.tranActions.removeTran(tran);
  }

  get minDateTill(): string {
    return moment(this.tran.selectedSchedule.dateSince).format("YYYY-MM-DD");
  }

  @computedFrom("tran.selectedSchedule")
  get showHolidayRule(): boolean {
    return this.tran && 
      this.tran.selectedSchedule && 
      this.tran.selectedSchedule.allowsHolidayRule;
  }

  @computedFrom("tran.selectedSchedule")
  get showDateRange(): boolean {
    return this.tran && 
      this.tran.selectedSchedule && 
      this.tran.selectedSchedule.allowsDateRange;
  }

  @computedFrom("tran.date")
  get allOptions(): Schedule[] {
    const date = moment(this.tran.date);
    const options: Schedule[] = [];

    if (this.tran.date == null || this.tran.date == '') {
      return options;
    }


    options.push(
      new Schedule("Every " + moment(date).format("dddd"), {
        dayOfWeek: date.day()
      })
    );

    options.push(
      new Schedule("Monthly, on the " + moment(date).format("Do"), {
        day: date.date()
      })
    );

    options.push(
      new Schedule("Once a year, on " + moment(date).format("MMM Do"), {
        day: date.date(),
        month: date.month() + 1
      })
    );

    options.push(
      new Schedule("Once, on " + moment(date).format("MMM Do YYYY"), {
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

  @computedFrom("cron")
  get scheduleLabel(): string {
    const sched = this.tran.selectedSchedule;
    let label = cronstr(sched.cron);
    if (sched.allowsHolidayRule) {
      label += ", " + HolidayRule[sched.holidayRule] + " holidays";
    }
    if (sched.dateSince && sched.dateTill) {
      label += ", between " + moment(sched.dateSince).format('MMMM Do YYYY') + " and " + moment(sched.dateTill).format('MMMM Do YYYY');
    } else if (sched.dateSince) {
      label += ", starting from " + moment(sched.dateSince).format('MMMM Do YYYY');
    } else if (sched.dateTill) {
      label += ", until " + moment(sched.dateTill).format('MMMM Do YYYY');
    }
    return label;
  }
  
  @computedFrom("cron")
  get scheduleId(): string {
    return [this.tran.selectedSchedule.holidayRule, ...this.tran.selectedSchedule.cron]
      .join("_").replace(/[#<>/-]/, "_");
  }

  @computedFrom("cron")
  get scheduleCron(): string {
    return this.tran.selectedSchedule.cron.join(" ");
  }
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
