export const EVENT = {
    ROOM: {
        SEND_MESSAGE: 'room:send_message',
        ON_MESSAGE_SENDED: 'room:on_message_sended',

        UPDATE_SETTINGS: 'room:update_settings',
        ON_UPDATE_SETTINGS: 'room:on_update_settings',

        UPDATE_URL: 'room:update_url',
        ON_UPDATE_URL: 'room:on_update_url',

        ON_UPDATE: 'room:on_update',

        CREATE: 'room:create',
        ON_CREATED: 'room:on_created',

        JOIN: 'room:join',
        ON_JOIN: 'room:on_join',

        LEAVE: 'room:leave',
    },
    LIST: {
        FETCH: 'rooms:fetch',
        ON_FETCHED: 'rooms:on_fetch',
    },
};
