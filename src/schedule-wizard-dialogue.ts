import {
    autoinject,
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { ScheduleWizardCustomElement } from 'schedule-wizard';
import { TranTemplate } from "./model/tran-template";

@autoinject()
export class ScheduleWizardDialogueCustomElement {
    public constructor(private dialogService: DialogService) { }

    openScheduleWizard() {
        let tran = new TranTemplate();
        this.dialogService.open({ viewModel: ScheduleWizardCustomElement, model: tran, lock: false }).whenClosed(response => {
            if (!response.wasCancelled) {
                console.log('good');
            } else {
                console.log('bad');
            }
            console.log(response.output);
        });
    }
}