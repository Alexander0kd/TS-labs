import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { IRoom } from '@app/interfaces/room.interface';
import { WS_EVENT } from '@app/mapper/ws-event.mapper';
import { Observable, switchMap } from 'rxjs';
import { ICreateRoom, IJoinRoom, ILeaveRoom } from './connection-messages.interface';

@Injectable({
    providedIn: 'root',
})
export class ConnectionService {
    private currentRoomUUID: string | null = null;

    constructor(private webSocketService: WebSocketService) {
        this.webSocketService.connect();
    }

    get userId(): string {
        return this.webSocketService.getUserId();
    }

    createRoom(roomName: string, isPublic: boolean): Observable<IRoom> {
        return this.webSocketService.createTwoSideWSConnection<IRoom, ICreateRoom>(
            WS_EVENT.CONNECTION.CREATE_ROOM,
            { roomName, isPublic },
            WS_EVENT.CONNECTION.ON_ROOM_CREATED,
            'ONE'
        );
    }

    getPublicRooms(): Observable<IRoom[] | null> {
        return this.webSocketService.createTwoSideWSConnection<IRoom[], undefined>(
            WS_EVENT.CONNECTION.GET_ROOM_LIST,
            undefined,
            WS_EVENT.CONNECTION.ON_ROOMS_LIST_UPDATE,
            'IDENTITY'
        );
    }

    joinRoom(roomId: string): Observable<IRoom> {
        return this.webSocketService
            .createTwoSideWSConnection<
                IRoom,
                IJoinRoom
            >(WS_EVENT.CONNECTION.JOIN_ROOM, { roomId }, WS_EVENT.CONNECTION.ON_ROOM_JOINED, 'ONE')
            .pipe(
                switchMap((room) => {
                    if (room) {
                        this.currentRoomUUID = room.uuid;
                        return this.subscribeToRoomUpdates();
                    }

                    return new Observable<IRoom>((observer) => {
                        this.currentRoomUUID = null;
                        observer.error(new Error('Room not found'));
                    });
                })
            );
    }

    leaveRoom(roomId: string): void {
        this.currentRoomUUID = null;
        this.webSocketService.send<ILeaveRoom>(WS_EVENT.CONNECTION.LEAVE_ROOM, { roomId });
    }

    private subscribeToRoomUpdates(): Observable<IRoom> {
        return new Observable<IRoom>((observer) => {
            const subscription = this.webSocketService.listen<IRoom>(WS_EVENT.ROOM.ON_UPDATE).subscribe({
                next: (response: IRoom) => {
                    if (this.currentRoomUUID && this.currentRoomUUID === response.uuid) {
                        this.currentRoomUUID = response.uuid;
                        observer.next(response);
                    }
                },
                error: (error) => {
                    observer.error(error);
                },
            });

            // Виконується перед відпискою
            // complete - не спрацює, оскільки ми уже відписались
            return () => {
                subscription.unsubscribe();
                this.webSocketService.stopListening(WS_EVENT.ROOM.ON_UPDATE);
            };
        });
    }
}
