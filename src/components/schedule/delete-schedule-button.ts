import {
    autoinject,
    containerless,
    bindable
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { TranTemplate } from "../../model/tran-template";
import { PLATFORM } from 'aurelia-pal';

@autoinject()
@containerless()
export class DeleteScheduleButtonCustomElement {
    public isDialogUp: boolean = false;
    @bindable public tran: TranTemplate = null;

    public constructor(private dialogService: DialogService) { }

    openDeleter() {
        this.isDialogUp = true;
        this.dialogService.open({ viewModel: PLATFORM.moduleName('components/schedule/delete-schedule'), model: this.tran, lock: false }).whenClosed(response => {
            this.isDialogUp = false;
        });
    }
}
