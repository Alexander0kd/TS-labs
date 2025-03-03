import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';
import { ISyncEvent } from '@app/interfaces/sync-event.interface';
import { WS_EVENT } from '@app/mapper/ws-event.mapper';
import { IMessage } from '@app/interfaces/message.interface';

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

    // For Admin
    broadcastVideoSync(roomUUID: string, sync: ISyncEvent): void {
        this.webSocketService.send<{ roomUUID: string; sync: ISyncEvent }>(WS_EVENT.ROOM.VIDEO_UPDATE, {
            roomUUID,
            sync,
        });
    }

    broadcastVideoChange(roomUUID: string, contentUrl: string): void {
        this.broadcastVideoSync(roomUUID, {
            action: 'change',
            isPlaying: false,
            payload: {
                currentTime: 0,
                speed: 1,
                videoUrl: contentUrl,
                toAdmin: true,
            },
        });
    }

    // For User
    subscribeToVideoEvents(): Observable<ISyncEvent> {
        return new Observable<ISyncEvent>((observer) => {
            const subscription = this.webSocketService.listen<ISyncEvent>(WS_EVENT.ROOM.ON_VIDEO_UPDATE).subscribe({
                next: (response: ISyncEvent) => {
                    observer.next(response);
                },
                error: (error) => {
                    observer.error(error);
                },
            });

            // Виконується перед відпискою
            // complete - не спрацює, оскільки ми уже відписались
            return () => {
                subscription.unsubscribe();
                this.webSocketService.stopListening(WS_EVENT.ROOM.ON_VIDEO_UPDATE);
            };
        });
    }

    // Messages
    subscribeToMessageEvents(): Observable<IMessage> {
        return new Observable<IMessage>((observer) => {
            const subscription = this.webSocketService.listen<IMessage>(WS_EVENT.ROOM.ON_MESSAGE_RECEIVED).subscribe({
                next: (response: IMessage) => {
                    observer.next(response);
                },
                error: (error) => {
                    observer.error(error);
                },
            });

            // Виконується перед відпискою
            // complete - не спрацює, оскільки ми уже відписались
            return () => {
                subscription.unsubscribe();
                this.webSocketService.stopListening(WS_EVENT.ROOM.ON_MESSAGE_RECEIVED);
            };
        });
    }

    sendMessage(roomUUID: string, message: IMessage): void {
        this.webSocketService.send<{ roomUUID: string; message: IMessage }>(WS_EVENT.ROOM.SEND_MESSAGE, {
            roomUUID,
            message,
        });
    }
}
