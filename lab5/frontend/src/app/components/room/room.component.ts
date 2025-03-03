import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '@app/enums/user-role.enum';
import { IRoom } from '@app/interfaces/room.interface';
import { ConnectionService } from '@app/services/connection/connection.service';
import { Subject, takeUntil } from 'rxjs';
import { SettingsComponent } from './settings/settings.component';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrl: './room.component.scss',
})
export class RoomComponent implements OnDestroy, OnInit {
    private destroy$: Subject<void> = new Subject<void>();

    userId: string | null = null;

    room: IRoom | null = null;
    error: string | null = null;

    isLoading: boolean = true;
    isAdmin: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private connectionService: ConnectionService
    ) {}

    ngOnInit(): void {
        const roomId = this.route.snapshot.paramMap.get('uuid');

        if (!roomId) {
            this.error = 'Room ID is missing';
            this.isLoading = false;
            return;
        }

        this.userId = this.connectionService.userId;
        this.joinRoom(roomId);
    }

    private joinRoom(roomId: string): void {
        this.connectionService
            .joinRoom(roomId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (room) => {
                    this.room = room;
                    this.checkIsAdmin();

                    this.isLoading = false;
                },
                error: (error) => {
                    this.error = error.message || 'Failed to join room';
                    this.isLoading = false;
                },
            });
    }

    leaveRoom(navigate: boolean = true): void {
        if (this.room) {
            this.connectionService.leaveRoom(this.room.uuid);
        }

        if (navigate) this.router.navigate(['/']);
    }

    openSettings(): void {
        if (!this.isAdmin || !this.room) return;

        const dialog = this.dialog.open(SettingsComponent, { data: this.room });

        dialog.afterClosed().subscribe((updatedRoom) => {
            if (updatedRoom && this.room) {
                this.room.settings = updatedRoom;
            }
        });
    }

    private checkIsAdmin(): void {
        if (!this.room) {
            this.isAdmin = false;
            return;
        }

        const user = this.room.users.find((u) => u.uuid === this.userId);

        this.isAdmin = user ? user.role === UserRole.ADMIN : false;
    }

    ngOnDestroy(): void {
        this.leaveRoom(false);
        this.destroy$.next();
        this.destroy$.complete();
    }
}
