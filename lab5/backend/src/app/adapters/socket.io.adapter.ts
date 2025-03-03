import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { CONFIG } from '../configuration/configuration.enum';

export class SocketIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext,
        private configService: ConfigService
    ) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions): unknown {
        const origin = this.configService.get<string>(CONFIG.ALLOWED_ORIGINS).split(',');
        options.cors = { origin, methods: ['GET', 'POST'] };

        return super.createIOServer(port, options);
    }
}
