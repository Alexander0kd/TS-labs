import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IRoomSettings } from '@app/interfaces/room-settings.interface';
import { IRoom } from '@app/interfaces/room.interface';
import { WS_EVENT } from '@app/mapper/ws-event.mapper';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
})
export class SettingsComponent {
    settingsForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private webSocketService: WebSocketService,
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
        if (this.settingsForm.valid) {
            this.webSocketService.send<{ uuid: string; settings: IRoomSettings }>(WS_EVENT.ROOM.UPDATE, {
                uuid: this.data.uuid,
                settings: this.settingsForm.value,
            });
        }

        this.dialogRef.close(this.settingsForm.value);
    }
}
