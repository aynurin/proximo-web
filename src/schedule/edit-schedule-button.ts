import {
    autoinject,
    containerless,
    bindable
} from "aurelia-framework";
import { DialogService } from 'aurelia-dialog';
import { TranTemplate } from "../model/tran-template";
import { EditScheduleCustomElement } from "schedule/edit-schedule";

@autoinject()
@containerless()
export class EditScheduleButtonCustomElement {
    public isDialogUp: boolean = false;
    @bindable public tran: TranTemplate = null;

    public constructor(private dialogService: DialogService) { }

    openEditor() {
        this.isDialogUp = true;
        this.dialogService.open({ viewModel: EditScheduleCustomElement, model: this.tran, lock: false }).whenClosed(response => {
            this.isDialogUp = false;
        });
    }
}
