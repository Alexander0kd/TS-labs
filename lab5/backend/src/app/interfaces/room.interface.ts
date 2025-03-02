import { IRoomSettings } from './room-settings.interface';
import { IUser } from './user.interface';

export interface IRoom {
    uuid: string;
    settings: IRoomSettings;
    contentUrls: string[];
    users: IUser[];
}
