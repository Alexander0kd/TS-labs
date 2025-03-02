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
    providers: [],
})
export class AppModule {}
