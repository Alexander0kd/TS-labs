import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
// import { IRoom } from '@app/interfaces/room.interface';
// import { Observable, switchMap } from 'rxjs';
// import { WS_EVENT } from '@app/mapper/ws-event.mapper';
// import { IRoomSettings } from '@app/interfaces/room-settings.interface';
// import { v4 as uuid } from 'uuid';
// import { IMessage } from '@app/interfaces/message.interface';

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    constructor(private webSocketService: WebSocketService) {
        this.webSocketService.connect();
    }

    get userId(): string {
        return this.webSocketService.getUserId();
    }

    // updateContentUrl(url: string): Observable<boolean> {
    //     const currentRoom = this.currentRoom$.value;

    //     if (!currentRoom) {
    //         return of(false);
    //     }

    //     return new Observable<boolean>((observer) => {
    //         this.webSocketService.send(WS_EVENT.ROOM.UPDATE_URL, {
    //             roomId: currentRoom.uuid,
    //             url,
    //         });

    //         const subscription = this.webSocketService.listen<boolean>(WS_EVENT.ROOM.ON_UPDATE_URL).subscribe({
    //             next: (success) => {
    //                 observer.next(success);
    //                 observer.complete();
    //                 subscription.unsubscribe();
    //             },
    //             error: (error) => {
    //                 observer.error(error);
    //                 subscription.unsubscribe();
    //             },
    //         });
    //     });
    // }

    // updateSettings(settings: Partial<IRoomSettings>): Observable<boolean> {
    //     const currentRoom = this.currentRoom$.value;

    //     if (!currentRoom) {
    //         return of(false);
    //     }

    //     return new Observable<boolean>((observer) => {
    //         this.webSocketService.send(WS_EVENT.ROOM.UPDATE_SETTINGS, {
    //             roomId: currentRoom.uuid,
    //             settings,
    //         });

    //         const subscription = this.webSocketService.listen<boolean>(WS_EVENT.ROOM.ON_UPDATE_SETTINGS).subscribe({
    //             next: (success) => {
    //                 observer.next(success);
    //                 observer.complete();
    //                 subscription.unsubscribe();
    //             },
    //             error: (error) => {
    //                 observer.error(error);
    //                 subscription.unsubscribe();
    //             },
    //         });
    //     });
    // }

    // sendMessage(text: string): Observable<boolean> {
    //     const currentRoom = this.currentRoom$.value;

    //     if (!currentRoom) {
    //         return of(false);
    //     }

    //     const userId = this.webSocketService.getUserId();
    //     const user = currentRoom.users.find((p) => p.uuid === userId);

    //     if (!user) {
    //         return of(false);
    //     }

    //     const message: IMessage = {
    //         uuid: uuid(),
    //         senderName: user.name,
    //         content: text,
    //         timestamp: new Date(),
    //     };

    //     return new Observable<boolean>((observer) => {
    //         this.webSocketService.send(WS_EVENT.ROOM.SEND_MESSAGE, {
    //             roomId: currentRoom.uuid,
    //             message,
    //         });

    //         const subscription = this.webSocketService.listen<boolean>(WS_EVENT.ROOM.ON_MESSAGE_SENDED).subscribe({
    //             next: (success) => {
    //                 observer.next(success);
    //                 observer.complete();
    //                 subscription.unsubscribe();
    //             },
    //             error: (error) => {
    //                 observer.error(error);
    //                 subscription.unsubscribe();
    //             },
    //         });
    //     });
    // }
}
