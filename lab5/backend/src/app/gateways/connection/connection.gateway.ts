import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';
import { WS_EVENT } from '../../mapper/ws-event.mapper';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../../services/room.service';
import { ICreateRoom, IJoinRoom, ILeaveRoom } from './connection-messages.interface';

@WebSocketGateway()
export class ConnectionGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;
    private socketToUser: Map<string, string> = new Map();

    constructor(private readonly roomService: RoomService) {}

    handleDisconnect(client: Socket): void {
        const userId = this.socketToUser.get(client.id);

        if (userId) {
            // Find which room the user was in
            const rooms = Array.from(this.roomService.getAllPublicRooms());

            for (const room of rooms) {
                const user = Array.from(room.users.values()).find((u) => u.uuid === userId);

                if (user) {
                    this.handleLeaveRoom(client, { userId, data: { roomId: room.uuid } });
                }
            }
        }

        this.socketToUser.delete(client.id);
    }

    @SubscribeMessage(WS_EVENT.CONNECTION.CREATE_ROOM)
    handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() body: ICreateRoom): void {
        const room = this.roomService.createRoom(body.userId, body.data.roomName, body.data.isPublic);

        // Backend
        this.socketToUser.set(client.id, body.userId);
        client.join(room.uuid);

        // Frontend
        client.emit(WS_EVENT.CONNECTION.ON_ROOM_CREATED, room);
        this.server.emit(WS_EVENT.CONNECTION.ON_ROOMS_LIST_UPDATE, this.roomService.getAllPublicRooms());
    }

    @SubscribeMessage(WS_EVENT.CONNECTION.JOIN_ROOM)
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() body: IJoinRoom): void {
        this.socketToUser.set(client.id, body.userId);

        const newRoom = this.roomService.addUserToRoom(body.data.roomId, body.userId);
        if (!newRoom) {
            client.emit(WS_EVENT.CONNECTION.ON_ROOM_JOINED, newRoom);
            return;
        }

        // Backend
        client.join(body.data.roomId);

        // Frontend
        client.emit(WS_EVENT.CONNECTION.ON_ROOM_JOINED, newRoom);
        client.emit(WS_EVENT.ROOM.ON_UPDATE, newRoom);
        client.to(body.data.roomId).emit(WS_EVENT.ROOM.ON_UPDATE, newRoom);
        this.server.emit(WS_EVENT.CONNECTION.ON_ROOMS_LIST_UPDATE, this.roomService.getAllPublicRooms());
    }

    @SubscribeMessage(WS_EVENT.CONNECTION.LEAVE_ROOM)
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() body: ILeaveRoom): void {
        const newRoom = this.roomService.removeUserFromRoom(body.data.roomId, body.userId);

        // Notify other users in the room
        if (newRoom) {
            client.emit(WS_EVENT.ROOM.ON_UPDATE, newRoom);
            client.to(body.data.roomId).emit(WS_EVENT.ROOM.ON_UPDATE, newRoom);
        }

        client.leave(body.data.roomId);
        this.server.emit(WS_EVENT.CONNECTION.ON_ROOMS_LIST_UPDATE, this.roomService.getAllPublicRooms());
    }

    @SubscribeMessage(WS_EVENT.CONNECTION.GET_ROOM_LIST)
    handleGetRooms(@ConnectedSocket() client: Socket): void {
        const rooms = this.roomService.getAllPublicRooms();
        client.emit(WS_EVENT.CONNECTION.ON_ROOMS_LIST_UPDATE, rooms);
    }
}
