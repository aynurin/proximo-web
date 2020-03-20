import {
    ViewEngineHooks,
    View,
  } from "aurelia-framework";
  import { HolidayRule } from "./schedule";
import { TranType } from "./tran-template";

// By convention, Aurelia will look for any classes of the form
// {name}ViewEngineHooks and load them as a ViewEngineHooks resource. We can
// use the @viewEngineHooks decorator instead if we want to give the class a
// different name.
export class ScheduleViewEngineHooks implements ViewEngineHooks {
    // The `beforeBind` method is called before the ViewModel is bound to
    // the view. We want to expose the enum to the binding context so that
    // when Aurelia binds the data it will find our MediaType enum.
    beforeBind(view: View) {
      view.overrideContext["HolidayRule"] = HolidayRule;
      view.overrideContext["HolidayRules"] = Object.keys(HolidayRule).filter(
        key => typeof HolidayRule[key] === "number"
      );
      view.overrideContext["TranType"] = TranType;
      view.overrideContext["TranTypes"] = Object.keys(TranType).filter(
        key => typeof TranType[key] === "number"
      );
    }
  }
  