import { Pool } from 'pg';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { DatabaseService_1 } from './database_1.service';
const databasePoolFactory = async (configService: ConfigService) => {
    return new Pool({
        user: configService.get('DB_USERNAME_1'),
        host: configService.get('DB_HOST_1'),
        database: configService.get('DB_NAME_1'),
        password: configService.get('DB_PASSWORD_1'),
        port: configService.get<number>('DB_PORT_1'),
    });
};
@Module({
    providers: [
        DatabaseService_1,
        {
            provide: 'DATABASE_POOL',
            inject: [ConfigService],
            useFactory: databasePoolFactory,
        },
    ],
    exports: [DatabaseService_1],
})
export class DatabaseModule_1 implements OnApplicationShutdown {
    private readonly logger = new Logger(DatabaseModule_1.name);
    constructor(private readonly moduleRef: ModuleRef) { }
    onApplicationShutdown(signal?: string): any {
        this.logger.log(`Shutting down on signal ${signal}`);
        const pool = this.moduleRef.get('DATABASE_POOL') as Pool;
        return pool.end();
    }
}