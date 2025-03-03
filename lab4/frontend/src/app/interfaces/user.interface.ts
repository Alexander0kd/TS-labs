import { UserRole } from '@app/enums/user-role.enum';

export interface IUser {
    uuid: string;
    name: string;
    role: UserRole;
}
