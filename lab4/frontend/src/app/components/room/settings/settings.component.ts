import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IRoom } from '@app/interfaces/room.interface';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
})
export class SettingsComponent {
    settingsForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<SettingsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IRoom
    ) {
        this.settingsForm = this.fb.group({
            name: [data.settings.name],
            allowVideoChange: [data.settings.allowVideoChange],
            allowChangeUrl: [data.settings.allowChangeUrl],
            allowChat: [data.settings.allowChat],
            isPublic: [data.settings.isPublic],
        });
    }

    onSave(): void {
        this.dialogRef.close(this.settingsForm.value);
    }
}
