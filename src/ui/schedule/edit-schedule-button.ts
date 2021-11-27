import {
    autoinject,
    containerless,
    bindable
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { TranTemplate } from "lib/model/tran-template";
import { PLATFORM } from 'aurelia-pal';

@autoinject()
@containerless()
export class EditScheduleButtonCustomElement {
    public isDialogUp: boolean = false;
    @bindable public tran: TranTemplate = null;

    public constructor(private dialogService: DialogService) { }

    openEditor() {
        this.isDialogUp = true;
        this.dialogService.open({ viewModel: PLATFORM.moduleName('ui/schedule/edit-schedule'), model: this.tran, lock: false }).whenClosed(response => {
            this.isDialogUp = false;
        });
    }
}
