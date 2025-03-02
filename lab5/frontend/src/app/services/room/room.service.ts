import { Injectable } from '@angular/core';
import { IRoom } from '@app/interfaces/room.interface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { WebSocketService } from '../web-socket/web-socket.service';
import { UserRole } from '@app/enums/user-role.enum';
import { IRoomSettings } from '@app/interfaces/room-settings.interface';
import { IUser } from '@app/interfaces/user.interface';
import { v4 as uuid } from 'uuid';
import { EVENT } from '@app/mapper/ws-event.mapper';
import { IMessage } from '@app/interfaces/message.interface';

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private currentRoom$ = new BehaviorSubject<IRoom | null>(null);
    private publicRooms$ = new BehaviorSubject<IRoom[] | null>(null);

    constructor(private webSocketService: WebSocketService) {
        this.webSocketService.connect();

        // Listen for room updates
        this.webSocketService.listen<IRoom>(EVENT.ROOM.ON_UPDATE).subscribe((room) => {
            if (this.currentRoom$.value && this.currentRoom$.value.uuid === room.uuid) {
                this.currentRoom$.next(room);
            }
        });

        // Listen for public rooms list updates
        this.webSocketService.listen<IRoom[]>(EVENT.LIST.ON_FETCHED).subscribe((rooms) => {
            this.publicRooms$.next(rooms);
        });

        // Request public rooms list
        this.webSocketService.send(EVENT.LIST.FETCH, {});
    }

    createRoom(roomName: string, isPublic: boolean): Observable<IRoom> {
        const userId = this.webSocketService.getUserId();
        const user: IUser = {
            uuid: userId,
            name: `User-${userId.substring(0, 5)}`,
            role: UserRole.ADMIN,
        };

        const newRoom: IRoom = {
            uuid: uuid(),
            settings: {
                name: roomName,
                allowVideoChange: true,
                allowVideoPlayerChange: true,
                allowChat: true,
                isPublic: isPublic,
            },
            contentUrls: [],
            users: [user],
        };

        return new Observable<IRoom>((observer) => {
            this.webSocketService.send(EVENT.ROOM.CREATE, newRoom);

            const subscription = this.webSocketService.listen<IRoom>(EVENT.ROOM.ON_CREATED).subscribe({
                next: (room) => {
                    this.currentRoom$.next(room);
                    observer.next(room);
                    observer.complete();
                    subscription.unsubscribe();
                },
                error: (error) => {
                    observer.error(error);
                    subscription.unsubscribe();
                },
            });
        });
    }

    joinRoom(roomId: string, userName?: string): Observable<IRoom> {
        const userId = this.webSocketService.getUserId();
        const user: IUser = {
            uuid: userId,
            name: userName || `User-${userId.substring(0, 5)}`,
            role: UserRole.USER,
        };

        return new Observable<IRoom>((observer) => {
            this.webSocketService.send(EVENT.ROOM.JOIN, { roomId, user });

            const subscription = this.webSocketService.listen<IRoom>(EVENT.ROOM.ON_JOIN).subscribe({
                next: (room) => {
                    this.currentRoom$.next(room);
                    observer.next(room);
                    observer.complete();
                    subscription.unsubscribe();
                },
                error: (error) => {
                    observer.error(error);
                    subscription.unsubscribe();
                },
            });
        });
    }

    leaveRoom(): void {
        const currentRoom = this.currentRoom$.value;

        if (currentRoom) {
            this.webSocketService.send(EVENT.ROOM.LEAVE, { roomId: currentRoom.uuid });
            this.currentRoom$.next(null);
        }
    }

    updateContentUrl(url: string): Observable<boolean> {
        const currentRoom = this.currentRoom$.value;

        if (!currentRoom) {
            return of(false);
        }

        return new Observable<boolean>((observer) => {
            this.webSocketService.send(EVENT.ROOM.UPDATE_URL, {
                roomId: currentRoom.uuid,
                url,
            });

            const subscription = this.webSocketService.listen<boolean>(EVENT.ROOM.ON_UPDATE_URL).subscribe({
                next: (success) => {
                    observer.next(success);
                    observer.complete();
                    subscription.unsubscribe();
                },
                error: (error) => {
                    observer.error(error);
                    subscription.unsubscribe();
                },
            });
        });
    }

    updateSettings(settings: Partial<IRoomSettings>): Observable<boolean> {
        const currentRoom = this.currentRoom$.value;

        if (!currentRoom) {
            return of(false);
        }

        return new Observable<boolean>((observer) => {
            this.webSocketService.send(EVENT.ROOM.UPDATE_SETTINGS, {
                roomId: currentRoom.uuid,
                settings,
            });

            const subscription = this.webSocketService.listen<boolean>(EVENT.ROOM.ON_UPDATE_SETTINGS).subscribe({
                next: (success) => {
                    observer.next(success);
                    observer.complete();
                    subscription.unsubscribe();
                },
                error: (error) => {
                    observer.error(error);
                    subscription.unsubscribe();
                },
            });
        });
    }

    sendMessage(text: string): Observable<boolean> {
        const currentRoom = this.currentRoom$.value;

        if (!currentRoom) {
            return of(false);
        }

        const userId = this.webSocketService.getUserId();
        const user = currentRoom.users.find((p) => p.uuid === userId);

        if (!user) {
            return of(false);
        }

        const message: IMessage = {
            uuid: uuid(),
            senderName: user.name,
            content: text,
            timestamp: new Date(),
        };

        return new Observable<boolean>((observer) => {
            this.webSocketService.send(EVENT.ROOM.SEND_MESSAGE, {
                roomId: currentRoom.uuid,
                message,
            });

            const subscription = this.webSocketService.listen<boolean>(EVENT.ROOM.ON_MESSAGE_SENDED).subscribe({
                next: (success) => {
                    observer.next(success);
                    observer.complete();
                    subscription.unsubscribe();
                },
                error: (error) => {
                    observer.error(error);
                    subscription.unsubscribe();
                },
            });
        });
    }

    getCurrentRoom(): Observable<IRoom | null> {
        return this.currentRoom$.asObservable();
    }

    getPublicRooms(): Observable<IRoom[] | null> {
        this.webSocketService.send(EVENT.LIST.FETCH, {});
        return this.publicRooms$.asObservable();
    }
}
