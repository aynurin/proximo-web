import {
  bindable,
  autoinject,
  computedFrom
} from "aurelia-framework";
import cronstr from "../components/cronstr";
import * as moment from "moment";

import { Store, connectTo } from "aurelia-store";
import { State } from "../state";

import { Schedule, HolidayRule } from "../model/schedule";
import { TranTemplate } from "../model/tran-template";
import { TranStateActions } from "../model/tran-actions";
import { DialogController } from 'aurelia-dialog';
import { LogManager } from 'aurelia-framework';

const log = LogManager.getLogger('edit-schedule');


@autoinject()
@connectTo()
export class WelcomeCustomElement {
  tran1: FormRowTranTemplate = new FormRowTranTemplate();
  tran2: FormRowTranTemplate = new FormRowTranTemplate();
  tran3: FormRowTranTemplate = new FormRowTranTemplate();
  tran4: FormRowTranTemplate = new FormRowTranTemplate();
  tran5: FormRowTranTemplate = new FormRowTranTemplate();
  addedTrans: FormRowTranTemplate[] = [];
  welcomeForm: HTMLFormElement;
  public state: State;

  public constructor(
    private dialogController: DialogController,
    private tranActions: TranStateActions) { }

  get canSave(): boolean {
    return this.getTransactionsToSave() !== false;
  }

  getTransactionsToSave(): FormRowTranTemplate[] | false {
    const allTrans = [this.tran1, this.tran2, this.tran3, this.tran4, this.tran5, ...this.addedTrans];
    const toSave = [];
    for (const tran of allTrans) {
      if (tran != null && tran.isRequired && !tran.isValid) {
        return false;
      }
      if (tran != null && tran.isValid) {
        toSave.push(tran);
      }
    }
    return toSave;
  }

  addMore() {
    console.log('addMore');
    this.addedTrans.push(new FormRowTranTemplate());
  }

  saveSchedule() {
    const toSave = this.getTransactionsToSave();
    console.log('saving', toSave);
    this.tran1 = new FormRowTranTemplate();
    this.tran2 = new FormRowTranTemplate();
    this.tran3 = new FormRowTranTemplate();
    this.tran4 = new FormRowTranTemplate();
    this.tran5 = new FormRowTranTemplate();
    this.addedTrans = [];
    this.welcomeForm.reset();
  }
}

export class FormRowTranTemplate {
  amount: string;
  monthDate: string;
  description: string;

  get isRequired(): boolean {
    return (this.amount && this.amount != "") ||
      (this.monthDate && this.monthDate != "") ||
      (this.description && this.description != "")
  }

  get isValid(): boolean {
    const floatAmount = parseFloat(this.amount);
    const intDate = parseInt(this.monthDate);
    return (this.amount && this.amount != "" && floatAmount != 0 && !isNaN(floatAmount)) ||
      (this.monthDate && this.monthDate != "" && intDate >= 1 && intDate <= 31 && !isNaN(intDate)) ||
      (this.description && this.description != "")
  }
}