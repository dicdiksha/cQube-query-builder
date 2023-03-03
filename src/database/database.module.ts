import { Pool } from 'pg';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { DatabaseService } from './database.service';
const databasePoolFactory = async (configService: ConfigService) => {
    return new Pool({
        user: configService.get('DB_USERNAME'),
        host: configService.get('DB_HOST'),
        database: configService.get('DB_NAME'),
        password: configService.get('DB_PASSWORD'),
        port: configService.get<number>('DB_PORT'),
    });
};
@Module({
    providers: [
        DatabaseService,
        {
            provide: 'DATABASE_POOL',
            inject: [ConfigService],
            useFactory: databasePoolFactory,
        },
    ],
    exports: [DatabaseService],
})
export class DatabaseModule implements OnApplicationShutdown {
    private readonly logger = new Logger(DatabaseModule.name);
    constructor(private readonly moduleRef: ModuleRef) { }
    onApplicationShutdown(signal?: string): any {
        this.logger.log(`Shutting down on signal ${signal}`);
        const pool = this.moduleRef.get('DATABASE_POOL') as Pool;
        return pool.end();
    }
}