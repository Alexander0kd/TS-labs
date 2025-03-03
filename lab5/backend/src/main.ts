import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from './app/configuration/configuration.enum';
import { ValidationPipe } from '@nestjs/common';
import { SocketIoAdapter } from './app/adapters/socket.io.adapter';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configuration = app.get(ConfigService);

    app.enableCors({
        origin: configuration.get<string>(CONFIG.ALLOWED_ORIGINS).split(','),
    });
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new SocketIoAdapter(app, configuration));

    if (configuration.get<string>(CONFIG.NODE_ENV) === 'dev') {
        const sw = await import('@nestjs/swagger');
        const config = new sw.DocumentBuilder()
            .setTitle('Backend')
            .setDescription('The Backend API description')
            .setVersion('0.1')
            .addTag('Endpoints')
            .build();

        const document = sw.SwaggerModule.createDocument(app, config);
        sw.SwaggerModule.setup('api', app, document);
    }

    await app.listen(configuration.get<number>(CONFIG.PORT));
}

bootstrap();
