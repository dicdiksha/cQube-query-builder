import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(json({ limit: '1000mb' }));
    app.use(urlencoded({ extended: true, limit: '1000mb' }));
    const config = new DocumentBuilder()
        .setTitle('CQUBE')
        .setDescription('[ Base URL: /v0 ]')
        .setVersion('1.0.0')
        .build(); 
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    app.enableCors();
    await app.listen(3008);
}

bootstrap();
