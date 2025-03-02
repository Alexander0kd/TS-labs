import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '@app/enums/user-role.enum';
import { IRoom } from '@app/interfaces/room.interface';
import { RoomService } from '@app/services/room/room.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrl: './room.component.scss',
})
export class RoomComponent implements OnInit, OnDestroy {
    room: IRoom | null = null;
    error: string | null = null;
    isLoading: boolean = true;
    isSettingsOpen: boolean = false;

    private subscription: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private roomService: RoomService,
        private webSocketService: WebSocketService
    ) {}

    ngOnInit(): void {
        const roomId = this.route.snapshot.paramMap.get('uuid');

        if (!roomId) {
            this.error = 'Room ID is missing';
            this.isLoading = false;
            return;
        }

        this.joinRoom(roomId);

        this.subscription = this.roomService.getCurrentRoom().subscribe((room) => {
            if (room) {
                this.room = room;
            } else {
                this.error = 'Room Not Founded';
            }
            this.isLoading = false;
        });
    }

    ngOnDestroy(): void {
        this.leaveRoom();

        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    joinRoom(roomId: string): void {
        this.roomService.joinRoom(roomId).subscribe({
            next: () => {},
            error: (error) => {
                this.error = error.message || 'Failed to join room';
                this.isLoading = false;
            },
        });
    }

    leaveRoom(): void {
        this.roomService.leaveRoom();
    }

    exitRoom(): void {
        this.leaveRoom();
        this.router.navigate(['/']);
    }

    toggleSettings(): void {
        this.isSettingsOpen = !this.isSettingsOpen;
    }

    get isAdmin(): boolean {
        if (!this.room) {
            return false;
        }

        const userId = this.webSocketService.getUserId();
        const user = this.room.users.find((u) => u.uuid === userId);

        return user ? user.role === UserRole.ADMIN : false;
    }

    // !
    // !
    // !

    updateContentUrl(url: string): void {
        this.roomService.updateContentUrl(url).subscribe({
            next: (success) => {
                if (!success) {
                    this.error = 'You do not have permission to change the content';
                    setTimeout(() => (this.error = null), 3000);
                }
            },
            error: (error) => {
                this.error = error.message || 'Failed to update content';
            },
        });
    }
}
