import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IRoom } from '@app/interfaces/room.interface';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, OnDestroy {
    rooms: IRoom[] = [];
    isLoading = true;
    error: string | null = null;
    private subscription: Subscription | null = null;

    constructor(
        private roomService: RoomService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadRooms();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    loadRooms(): void {
        this.isLoading = true;
        this.error = null;

        this.subscription = this.roomService.getPublicRooms().subscribe({
            next: (rooms) => {
                if (rooms) {
                    this.rooms = rooms;
                    this.isLoading = false;
                }
            },
            error: (error) => {
                this.error = error.message || 'Failed to load rooms';
                this.isLoading = false;
            },
        });
    }

    joinRoom(roomId: string): void {
        this.roomService.joinRoom(roomId).subscribe({
            next: (room) => {
                this.router.navigate(['/room', room.uuid]);
            },
            error: (error) => {
                this.error = error.message || 'Failed to join room';
            },
        });
    }

    navigateToHome(): void {
        this.router.navigate(['/']);
    }
}
