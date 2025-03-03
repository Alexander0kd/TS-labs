import { WebSocketGateway, SubscribeMessage, ConnectedSocket, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IMessage } from 'src/app/interfaces/message.interface';
import { IRoomSettings } from 'src/app/interfaces/room-settings.interface';
import { ISyncEvent } from 'src/app/interfaces/sync-event.interface';
import { WS_EVENT } from 'src/app/mapper/ws-event.mapper';
import { RoomService } from 'src/app/services/room.service';

@WebSocketGateway()
export class RoomGateway {
    @WebSocketServer()
    private server: Server;

    constructor(private readonly roomService: RoomService) {}

    @SubscribeMessage(WS_EVENT.ROOM.UPDATE)
    updateRoomSettings(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { userId: string; data: { uuid: string; settings: IRoomSettings } }
    ): void {
        const newRoom = this.roomService.updateRoom(body.data.uuid, body.data.settings);
        if (!newRoom) return;

        client.to(body.data.uuid).emit(WS_EVENT.ROOM.ON_UPDATE, newRoom);

        const rooms = this.roomService.getAllPublicRooms();
        this.server.emit(WS_EVENT.CONNECTION.ON_ROOMS_LIST_UPDATE, rooms);
    }

    @SubscribeMessage(WS_EVENT.ROOM.VIDEO_UPDATE)
    broadcastVideoSync(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { userId: string; data: { roomUUID: string; sync: ISyncEvent } }
    ): void {
        const sync = this.roomService.changeVideoData(body.data.roomUUID, body.data.sync);

        client.to(body.data.roomUUID).emit(WS_EVENT.ROOM.ON_VIDEO_UPDATE, sync);
    }

    @SubscribeMessage(WS_EVENT.ROOM.SEND_MESSAGE)
    sendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { userId: string; data: { roomUUID: string; message: IMessage } }
    ): void {
        client.to(body.data.roomUUID).emit(WS_EVENT.ROOM.ON_MESSAGE_RECEIVED, body.data.message);
    }
}
