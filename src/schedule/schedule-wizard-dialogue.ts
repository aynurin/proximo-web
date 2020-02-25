import {
    autoinject,
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { ScheduleWizardCustomElement } from 'schedule/schedule-wizard';
import { TranTemplate } from "../model/tran-template";

@autoinject()
export class ScheduleWizardDialogueCustomElement {
    public isDialogUp: boolean = false;
    public tran: TranTemplate = null;

    public constructor(private dialogService: DialogService) { }

    openScheduleWizard() {
        this.isDialogUp = true;
        this.tran = new TranTemplate();
        this.dialogService.open({ viewModel: ScheduleWizardCustomElement, model: this.tran, lock: false }).whenClosed(response => {
            this.isDialogUp = false;
            if (!response.wasCancelled) {
                console.log('good');
            }
        });
    }
}
