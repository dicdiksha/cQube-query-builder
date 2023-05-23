import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as mappings from '../maps/table_names.json';
import * as whitelist from '../maps/whitelist.json';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@Inject('DATABASE_POOL') private pool: Pool, @Inject(CACHE_MANAGER) private cacheManager: Cache) {
    }

    preprocessQuery(queryText: string): string {
        let result = queryText
        const extendedNames = Object.keys(mappings);
        if (extendedNames.some(tableName => new RegExp(`\\b${tableName}\\b`, 'i').test(queryText))) {
            extendedNames.forEach(extendedName => result = result.replace(new RegExp(extendedName, 'gi'), mappings[extendedName]))
        }

        return result;
    }

    async executeQuery(queryText: string, values: any[] = []): Promise<any[]> {
        // pre processing query here
        const preprocessedQuery = this.preprocessQuery(queryText);
        const cachedRes = await this.cacheManager.get(preprocessedQuery);
        if (cachedRes) {
            this.logger.debug(`Sending cached response for: ${preprocessedQuery} (${values})`);
            return cachedRes as Promise<any[]>;
        }
        this.logger.debug(`Executing query: ${preprocessedQuery} (${values})`);
        return this.pool.query(preprocessedQuery, values).then((result: QueryResult) => {
            this.cacheManager.set(preprocessedQuery, result.rows, 1000 * 60 * 60 * 24)
            return result.rows;
        });
    }


    async executeWhiteListedQuery(queryText: string, values: any[]): Promise<any[]> {
        const queries = whitelist?.queries;
        if (!queries.includes(queryText)) {
            throw new NotFoundException('Query not found');
        }

        const preprocessedQuery = this.preprocessQuery(queryText);
        return this.pool.query(preprocessedQuery, values).then((result: QueryResult) => {
            return result.rows;
        });
    }
}