import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
// import {TypeOrmModule} from '@nestjs/typeorm';
import {TypeOrmModule} from '@nestjs/typeorm'
import {DatabaseModule} from './database/database.module';
import { MetricCsvService } from './services/metric-csv/metric-csv.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({

    controllers: [AppController],
    providers: [AppService, MetricCsvService],
    imports: [DatabaseModule,
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: +configService.get<number>('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_NAME'),
                entities: [],
                synchronize: false,
            }),
            inject: [ConfigService],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'src/maps'),
            renderPath: new RegExp('^/assets')
        })
    ],
})
export class AppModule {
}