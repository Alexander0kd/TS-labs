import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IRoom } from '@app/interfaces/room.interface';
import { ConnectionService } from '@app/services/connection/connection.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();

    rooms: IRoom[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private connectionService: ConnectionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadRooms();
    }

    loadRooms(): void {
        this.isLoading = true;
        this.error = null;

        this.connectionService
            .getPublicRooms()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
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
        this.router.navigate(['/room', roomId]);
    }

    navigateToHome(): void {
        this.router.navigate(['/']);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
