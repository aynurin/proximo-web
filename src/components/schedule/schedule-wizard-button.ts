import {
    autoinject,
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { PLATFORM } from 'aurelia-pal';
import { TranTemplate } from "../../model/tran-template";
import { IntroBuildingContext } from "components/intro-building-context";

@autoinject()
export class ScheduleWizardButtonCustomElement {
    public isDialogUp: boolean = false;
    public tran: TranTemplate = null;

    public constructor(
        private dialogService: DialogService,
        private introContext: IntroBuildingContext) { }

    openScheduleWizard() {
        this.isDialogUp = true;
        this.tran = new TranTemplate();
        this.dialogService.open({ viewModel: PLATFORM.moduleName('components/schedule/schedule-wizard'), model: this.tran, lock: false }).whenClosed(response => {
            this.isDialogUp = false;
            this.introContext.clear();
        });
    }
}
