import {
  autoinject,
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { PLATFORM } from 'aurelia-pal';
import { IScheduledTransaction } from 'lib/model/ScheduledTransaction';

@autoinject()
export class ScheduleWizardButtonCustomElement {
  public isDialogUp = false;

  public constructor(
    private dialogService: DialogService,
    private element: Element) { }

  async openScheduleWizard() {
    this.isDialogUp = true;
    await this.dialogService.open({ viewModel: PLATFORM.moduleName('ui/schedule/wizard/schedule-wizard'), lock: false }).whenClosed(response => {
      this.isDialogUp = false;
      this.onScheduleSave(response.output as IScheduledTransaction);
    });
  }

  onScheduleSave(scheduled: IScheduledTransaction) {
    const event = new CustomEvent('create', {
      detail: scheduled,
      bubbles: true
    });

    this.element.dispatchEvent(event);
  }
}
