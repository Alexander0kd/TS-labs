export interface ICreateRoom {
    roomName: string;
    isPublic: boolean;
}

export interface IJoinRoom {
    roomId: string;
}

export interface ILeaveRoom {
    roomId: string;
}
