import { Injectable } from '@nestjs/common';
import { IRoom } from '../interfaces/room.interface';
import { UserRole } from '../enums/user-role.enum';
import { IUser } from '../interfaces/user.interface';
import { v4 as uuid } from 'uuid';
import { ISyncEvent } from '../interfaces/sync-event.interface';
import { IRoomSettings } from '../interfaces/room-settings.interface';

@Injectable()
export class RoomService {
    private rooms: Map<string, IRoom> = new Map();

    createRoom(userId: string, roomName: string, isPublic: boolean): IRoom {
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
                allowChangeUrl: true,
                allowChat: true,
                isPublic: isPublic,
            },
            contentUrl: '',
            users: [user],
        };

        this.rooms.set(newRoom.uuid, newRoom);
        return newRoom;
    }

    removeUserFromRoom(roomUuid: string, userId: string): IRoom | undefined {
        const room = this.rooms.get(roomUuid);

        if (room) {
            const userIndex = room.users.findIndex((u) => u.uuid === userId);
            if (userIndex === -1) return;

            const user = room.users[userIndex];
            room.users.splice(userIndex, 1);

            if (room.users.length === 0) {
                this.rooms.delete(roomUuid);
                return;
            }

            if (user.role === UserRole.ADMIN) {
                const newAdmin = room.users[0];
                newAdmin.role = UserRole.ADMIN;
                room.users[0] = newAdmin;
            }
        }

        return room;
    }

    deleteRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }

    getAllPublicRooms(): IRoom[] {
        return Array.from(this.rooms.values()).filter((room) => room.settings.isPublic);
    }

    addUserToRoom(roomId: string, userId: string): IRoom | undefined {
        const room = this.rooms.get(roomId);

        if (room) {
            const isIn = room.users.find((us) => us.uuid === userId);
            if (!!isIn) return room;

            room.users.push({
                uuid: userId,
                name: `User-${userId.substring(0, 5)}`,
                role: UserRole.USER,
            });

            return room;
        }
    }

    changeVideoData(roomUUID: string, sync: ISyncEvent): ISyncEvent {
        const room = this.rooms.get(roomUUID);

        if (room && room.contentUrl !== sync.payload.videoUrl) {
            room.contentUrl = sync.payload.videoUrl;
            this.rooms.set(roomUUID, room);
        }

        return sync;
    }

    updateRoom(uuid: string, newSettings: IRoomSettings): IRoom | null {
        const room = this.rooms.get(uuid);

        if (room && JSON.stringify(room.settings) !== JSON.stringify(newSettings)) {
            room.settings = newSettings;
            this.rooms.set(uuid, room);
            return room;
        }

        console.log('2');
        return null;
    }
}
