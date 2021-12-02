import {
  autoinject,
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { PLATFORM } from 'aurelia-pal';
import { TranTemplate } from "lib/model/tran-template";

@autoinject()
export class ScheduleWizardButtonCustomElement {
  public isDialogUp: boolean = false;
  public tran: TranTemplate = null;

  public constructor(
    private dialogService: DialogService,
    private element: Element) { }

  openScheduleWizard() {
    this.isDialogUp = true;
    this.tran = new TranTemplate();
    this.dialogService.open({ viewModel: PLATFORM.moduleName('ui/schedule/wizard/schedule-wizard'), model: this.tran, lock: false }).whenClosed(response => {
      this.isDialogUp = false;
      this.onScheduleSave(response.output);
    });
  }

  onScheduleSave(schedule: TranTemplate) {
    const event = new CustomEvent('create', {
      detail: schedule,
      bubbles: true
    });

    this.element.dispatchEvent(event);
  }
}
