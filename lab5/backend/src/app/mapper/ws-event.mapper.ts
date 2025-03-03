export const WS_EVENT = {
    CONNECTION: {
        GET_ROOM_LIST: 'connection:get_room_list',
        ON_ROOMS_LIST_UPDATE: 'connection:on_rooms_list_update',

        CREATE_ROOM: 'connection:create_room',
        ON_ROOM_CREATED: 'connection:on_room_created',

        JOIN_ROOM: 'connection:join_room',
        ON_ROOM_JOINED: 'connection:on_room_joined',

        LEAVE_ROOM: 'connection:leave_room',
    },
    ROOM: {
        UPDATE: 'room:update',
        ON_UPDATE: 'room:on_update',

        VIDEO_UPDATE: 'room:video_update',
        ON_VIDEO_UPDATE: 'room:on_video_update',

        SEND_MESSAGE: 'room:send_message',
        ON_MESSAGE_RECEIVED: 'room:on_message_received',
    },
};
