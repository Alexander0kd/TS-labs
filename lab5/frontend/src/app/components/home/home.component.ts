import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '@app/services/connection/connection.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    createRoomForm: FormGroup;
    isCreating = false;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private connectionService: ConnectionService,
        private router: Router
    ) {
        this.createRoomForm = this.fb.group({
            roomName: ['', [Validators.required, Validators.minLength(3)]],
            isPublic: [true],
        });
    }

    onSubmit(): void {
        if (this.createRoomForm.invalid) {
            return;
        }

        this.isCreating = true;
        this.error = null;

        const { roomName, isPublic } = this.createRoomForm.value;

        this.connectionService.createRoom(roomName, isPublic).subscribe({
            next: (room) => {
                this.isCreating = false;

                this.router.navigate(['/room', room.uuid]);
            },
            error: (error) => {
                this.isCreating = false;
                this.error = error.message || 'Failed to create room';
            },
        });
    }

    navigateToRoomList(): void {
        this.router.navigate(['/list']);
    }
}
