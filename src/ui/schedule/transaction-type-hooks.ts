import {
    ViewEngineHooks,
    View,
  } from "aurelia-framework";
import { TransactionType } from "lib/model/TransactionBuilder";

// By convention, Aurelia will look for any classes of the form
// {name}ViewEngineHooks and load them as a ViewEngineHooks resource. We can
// use the @viewEngineHooks decorator instead if we want to give the class a
// different name.
export class TransactionTypeViewEngineHooks implements ViewEngineHooks {
    // The `beforeBind` method is called before the ViewModel is bound to
    // the view. We want to expose the enum to the binding context so that
    // when Aurelia binds the data it will find our MediaType enum.
    beforeBind(view: View) {
      view.overrideContext["TranType"] = TransactionType;
      view.overrideContext["TranTypes"] = Object.keys(TransactionType).filter(
        key => typeof TransactionType[key] === "number"
      );
    }
  }
  