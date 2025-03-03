interface IBaseMessage {
    userId: string;
    data: unknown;
}

export interface ICreateRoom extends IBaseMessage {
    data: {
        roomName: string;
        isPublic: boolean;
    };
}

export interface IJoinRoom extends IBaseMessage {
    data: {
        roomId: string;
    };
}

export interface ILeaveRoom extends IBaseMessage {
    data: {
        roomId: string;
    };
}
