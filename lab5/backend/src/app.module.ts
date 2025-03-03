import { ConnectionGateway } from './app/gateways/connection/connection.gateway';
import { RoomService } from './app/services/room.service';
import { RoomGateway } from './app/gateways/room/room.gateway';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationMapper } from './app/configuration/configuration.mapper';
import { ConfigurationValidation } from './app/configuration/configuration.validation';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/.env`,
            load: [ConfigurationMapper],
            cache: true,
            isGlobal: true,
            validationSchema: ConfigurationValidation,
        }),
    ],
    controllers: [],
    providers: [ConnectionGateway, RoomService, RoomGateway],
})
export class AppModule {}
