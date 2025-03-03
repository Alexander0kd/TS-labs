import { Injectable } from '@angular/core';
import { UserRole } from '@app/enums/user-role.enum';
import { IRoom } from '@app/interfaces/room.interface';
import { Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable({
    providedIn: 'root',
})
export class ConnectionService {
    private room: IRoom | null = null;

    get userId(): string {
        if (!localStorage.getItem('userId')) {
            const id = uuid();
            localStorage.setItem('userId', id);
            return id;
        }

        return String(localStorage.getItem('userId'));
    }

    createRoom(roomName: string, isPublic: boolean): Observable<IRoom> {
        this.room = {
            uuid: uuid(),
            settings: {
                name: roomName,
                allowVideoChange: true,
                allowChangeUrl: true,
                allowChat: true,
                isPublic,
            },
            contentUrl: 'dQw4w9WgXcQ',
            users: [
                {
                    uuid: this.userId,
                    name: `User-${this.userId.substring(0, 5)}`,
                    role: UserRole.ADMIN,
                },
            ],
        };

        return of(this.room);
    }

    getPublicRooms(): Observable<IRoom[] | null> {
        return this.room ? of([this.room]) : of([]);
    }

    joinRoom(roomId: string): Observable<IRoom> {
        if (!this.room || this.room.uuid !== roomId) {
            return new Observable<IRoom>((observer) => {
                this.room = null;
                observer.error(new Error('Room not found'));
            });
        }

        return of(this.room);
    }

    leaveRoom(roomId: string): void {
        if (this.room && roomId === this.room.uuid) {
            this.room = null;
        }
    }
}
