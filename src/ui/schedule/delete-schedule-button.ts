import { IScheduledTransaction } from 'lib/model/ScheduledTransaction';
import {
    autoinject,
    containerless,
    bindable
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { PLATFORM } from 'aurelia-pal';

@autoinject()
@containerless()
export class DeleteScheduleButtonCustomElement {
    public isDialogUp = false;
    @bindable public tran: IScheduledTransaction = null;

    public constructor(private dialogService: DialogService) { }

    async openDeleter() {
        this.isDialogUp = true;
        await this.dialogService.open({ viewModel: PLATFORM.moduleName('ui/schedule/delete-schedule'), model: this.tran, lock: false }).whenClosed(response => {
            this.isDialogUp = false;
        });
    }
}
